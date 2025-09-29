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

  /**
   * Actualizar solo la sección de suscripción
   */
  static async updateSubscription(
    user_id: string,
    subscriptionUpdates: Partial<UserProfile['subscription']>
  ): Promise<boolean> {
    try {
      const now = new Date().toISOString();

      // Si cambia el plan, actualizar las features automáticamente
      if (subscriptionUpdates.plan) {
        subscriptionUpdates.features = [
          ...PLAN_FEATURES[subscriptionUpdates.plan],
        ];
      }

      await client.update({
        TableName: TABLE_NAME,
        Key: { id: user_id },
        UpdateExpression: `SET 
          updated_at = :now,
          version = version + :inc,
          subscription = if_not_exists(subscription, :emptyObj)`,
        ExpressionAttributeValues: {
          ':now': now,
          ':inc': 1,
          ':emptyObj': {},
        },
      });

      // Luego actualizar los campos específicos de subscription
      const updateExpressions: string[] = [];
      const attributeValues: Record<string, any> = {};

      Object.entries(subscriptionUpdates).forEach(([key, value], index) => {
        const attrValue = `:val${index}`;
        updateExpressions.push(`subscription.#${key} = ${attrValue}`);
        attributeValues[attrValue] = value;
      });

      if (updateExpressions.length > 0) {
        await client.update({
          TableName: TABLE_NAME,
          Key: { id: user_id },
          UpdateExpression: `SET ${updateExpressions.join(', ')}`,
          ExpressionAttributeNames: Object.keys(subscriptionUpdates).reduce(
            (acc, key) => ({
              ...acc,
              [`#${key}`]: key,
            }),
            {}
          ),
          ExpressionAttributeValues: attributeValues,
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
  }

  /**
   * Actualizar estadísticas del usuario
   */
  static async updateStats(
    user_id: string,
    statsUpdates: Partial<UserProfile['stats']>
  ): Promise<boolean> {
    try {
      const now = new Date().toISOString();

      await client.update({
        TableName: TABLE_NAME,
        Key: { id: user_id },
        UpdateExpression: `SET 
          updated_at = :now,
          version = version + :inc,
          stats = if_not_exists(stats, :emptyStats)`,
        ExpressionAttributeValues: {
          ':now': now,
          ':inc': 1,
          ':emptyStats': DEFAULT_USER_PROFILE.stats,
        },
      });

      // Luego actualizar los campos específicos de stats
      const updateExpressions: string[] = [];
      const attributeValues: Record<string, any> = {};

      Object.entries(statsUpdates).forEach(([key, value], index) => {
        const attrValue = `:val${index}`;
        updateExpressions.push(`stats.#${key} = ${attrValue}`);
        attributeValues[attrValue] = value;
      });

      if (updateExpressions.length > 0) {
        await client.update({
          TableName: TABLE_NAME,
          Key: { id: user_id },
          UpdateExpression: `SET ${updateExpressions.join(', ')}`,
          ExpressionAttributeNames: Object.keys(statsUpdates).reduce(
            (acc, key) => ({
              ...acc,
              [`#${key}`]: key,
            }),
            {}
          ),
          ExpressionAttributeValues: attributeValues,
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating stats:', error);
      return false;
    }
  }

  /**
   * Incrementar contador específico en stats
   */
  static async incrementStat(
    user_id: string,
    statName: keyof UserProfile['stats'],
    increment: number = 1
  ): Promise<boolean> {
    try {
      const now = new Date().toISOString();

      await client.update({
        TableName: TABLE_NAME,
        Key: { id: user_id },
        UpdateExpression: `SET 
          updated_at = :now,
          version = version + :inc,
          stats.#statName = if_not_exists(stats.#statName, :zero) + :increment`,
        ExpressionAttributeNames: {
          '#statName': statName,
        },
        ExpressionAttributeValues: {
          ':now': now,
          ':inc': 1,
          ':increment': increment,
          ':zero': 0,
        },
      });

      return true;
    } catch (error) {
      console.error('Error incrementing stat:', error);
      return false;
    }
  }

  /**
   * Obtener perfiles públicos para búsquedas
   */
  static async getPublicProfiles(limit: number = 20): Promise<UserProfile[]> {
    try {
      const { Items } = await client.scan({
        TableName: TABLE_NAME,
        FilterExpression: 'privacy.profileVisibility = :visibility',
        ExpressionAttributeValues: {
          ':visibility': 'public',
        },
        Limit: limit,
      });

      return (Items as UserProfile[]) || [];
    } catch (error) {
      console.error('Error getting public profiles:', error);
      return [];
    }
  }

  /**
   * Buscar perfiles por skills o tecnologías
   */
  static async searchProfilesBySkills(
    skills: string[],
    limit: number = 20
  ): Promise<UserProfile[]> {
    try {
      const { Items } = await client.scan({
        TableName: TABLE_NAME,
        FilterExpression: 'contains(profile.skills, :skill)',
        ExpressionAttributeValues: {
          ':skill': skills[0], // Para simplificar, buscamos solo la primera skill
        },
        Limit: limit,
      });

      return (Items as UserProfile[]) || [];
    } catch (error) {
      console.error('Error searching profiles by skills:', error);
      return [];
    }
  }

  /**
   * Eliminar perfil (soft delete - marcar como inactivo)
   */
  static async deactivateProfile(user_id: string): Promise<boolean> {
    try {
      const now = new Date().toISOString();

      await client.update({
        TableName: TABLE_NAME,
        Key: { id: user_id },
        UpdateExpression: `SET 
          updated_at = :now,
          version = version + :inc,
          subscription.#status = :status,
          privacy.profileVisibility = :visibility`,
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':now': now,
          ':inc': 1,
          ':status': 'canceled',
          ':visibility': 'private',
        },
      });

      return true;
    } catch (error) {
      console.error('Error deactivating profile:', error);
      return false;
    }
  }

  /**
   * Verificar si el usuario tiene una feature específica
   */
  static async hasFeature(user_id: string, feature: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(user_id);
      return profile?.subscription.features.includes(feature) || false;
    } catch (error) {
      console.error('Error checking feature:', error);
      return false;
    }
  }

  /**
   * Obtener usuarios por plan de suscripción
   */
  static async getUsersByPlan(
    plan: UserProfile['subscription']['plan']
  ): Promise<UserProfile[]> {
    try {
      const { Items } = await client.scan({
        TableName: TABLE_NAME,
        FilterExpression: 'subscription.plan = :plan',
        ExpressionAttributeValues: {
          ':plan': plan,
        },
      });

      return (Items as UserProfile[]) || [];
    } catch (error) {
      console.error('Error getting users by plan:', error);
      return [];
    }
  }
}