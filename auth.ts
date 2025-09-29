
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import { DynamoDBAdapter } from "@auth/dynamodb-adapter"
import { UserProfileService } from '@/lib/dynamodb/user-profile-service';

const config: DynamoDBClientConfig = {
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
  },
  region: 'us-east-1',
};

const client = DynamoDBDocument.from(new DynamoDB(config), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: DynamoDBAdapter(client, {
    tableName: process.env.DYNAMODB_AUTH_TABLE_NAME!,
  }),
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  trustHost: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Agregar propiedades personalizadas al primer login
      if (account?.provider === 'google' && profile) {
        user.role = 'user'; // Rol por defecto
        user.description = 'Software Developer'; // Descripción por defecto

        // Crear perfil extendido en nuestra tabla personalizada
        try {
          await UserProfileService.createDefaultProfile(
            user.id!,
            user.email!,
            user.name || undefined
          );
        } catch (error) {
          console.error('Error creating user profile:', error);
          // No bloquear el login si falla la creación del perfil extendido
        }
      }
      return true;
    },
    async session({ session, user }) {
      // Incluir propiedades personalizadas en la sesión
      if (user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.description = user.description;

        // Opcionalmente, obtener información adicional del perfil extendido
        try {
          const userProfile = await UserProfileService.getProfile(user.id);
          if (userProfile) {
            // Actualizar la descripción con la del perfil extendido si existe
            session.user.description = userProfile.profile.description;
            // Agregar plan de suscripción a la sesión
            session.user.subscriptionPlan = userProfile.subscription.plan;
          }
        } catch (error) {
          console.error('Error fetching extended profile:', error);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // Incluir propiedades en el JWT
      if (user) {
        token.role = user.role;
        token.description = user.description;
      }
      return token;
    },
  },
});