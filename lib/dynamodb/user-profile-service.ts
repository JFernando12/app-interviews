import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { 
  UserProfile, 
  UserProfileUpdate, 
  DEFAULT_USER_PROFILE,
  PLAN_FEATURES 
} from "./schemas";

// Configuración de DynamoDB (reutilizamos la misma config)
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

const TABLE_NAME = 'app-interviews-users';

export class UserProfileService {
  /**
   * Obtener perfil completo del usuario
   */
  static async getProfile(user_id: string): Promise<UserProfile | null> {
    try {
      const { Item } = await client.get({
        TableName: TABLE_NAME,
        Key: { id: user_id },
      });

      return (Item as UserProfile) || null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Crear perfil por defecto para un nuevo usuario
   */
  static async createDefaultProfile(
    user_id: string,
    userEmail: string,
    userName?: string
  ): Promise<UserProfile> {
    const now = new Date().toISOString();

    const profile: UserProfile = {
      user_id,
      ...DEFAULT_USER_PROFILE,
      profile: {
        ...DEFAULT_USER_PROFILE.profile,
        // Si tenemos el nombre del usuario, lo usamos
        ...(userName && { title: userName }),
      },
      created_at: now,
      updated_at: now,
      version: 1,
    };

    try {
      await client.put({
        TableName: TABLE_NAME,
        Item: { id: user_id, ...profile },
        // Solo crear si no existe
        ConditionExpression: 'attribute_not_exists(id)',
      });

      return { id: user_id, ...profile } as UserProfile;
    } catch (error) {
      if ((error as any).name === 'ConditionalCheckFailedException') {
        // El perfil ya existe, lo obtenemos
        const existingProfile = await this.getProfile(user_id);
        if (existingProfile) return existingProfile;
      }

      console.error('Error creating default profile:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil completo
   */
  static async updateProfile(
    user_id: string,
    updates: UserProfileUpdate
  ): Promise<UserProfile | null> {
    try {
      const now = new Date().toISOString();

      // Construir la expresión de actualización dinámicamente
      const updateExpressionParts = [
        'updated_at = :now',
        'version = version + :inc',
      ];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {
        ':now': now,
        ':inc': 1,
      };

      // Procesar cada actualización
      Object.entries(updates).forEach(([key, value], index) => {
        if (key !== 'user_id' && key !== 'created_at' && key !== 'version') {
          const attrName = `#attr${index}`;
          const attrValue = `:val${index}`;

          updateExpressionParts.push(`${attrName} = ${attrValue}`);
          expressionAttributeNames[attrName] = key;
          expressionAttributeValues[attrValue] = value;
        }
      });

      const { Attributes } = await client.update({
        TableName: TABLE_NAME,
        Key: { id: user_id },
        UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      });

      return Attributes as UserProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }
}