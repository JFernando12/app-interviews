import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"

const config: DynamoDBClientConfig = {
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
  },
  region: 'us-east-1',
}

const client = DynamoDBDocument.from(new DynamoDB(config), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
})

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener el usuario actual de DynamoDB
    const result = await client.get({
      TableName: process.env.DYNAMODB_AUTH_TABLE_NAME!,
      Key: {
        pk: `USER#${session.user.id}`,
        sk: `USER#${session.user.id}`,
      }
    })

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: result.Item?.role || 'user',
        description: result.Item?.description || 'Software Developer'
      }
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { description, role } = body

    // Validaciones
    if (description && typeof description !== 'string') {
      return NextResponse.json({ error: 'Description must be a string' }, { status: 400 })
    }

    if (role && !['admin', 'user', 'interviewer', 'candidate'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Preparar los datos a actualizar
    const updateData: any = {}
    if (description !== undefined) updateData.description = description
    if (role !== undefined && session.user.role === 'admin') {
      // Solo admins pueden cambiar roles
      updateData.role = role
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Actualizar en DynamoDB
    await client.update({
      TableName: process.env.DYNAMODB_AUTH_TABLE_NAME!,
      Key: {
        pk: `USER#${session.user.id}`,
        sk: `USER#${session.user.id}`,
      },
      UpdateExpression: `SET ${Object.keys(updateData).map((key, index) => `#${key} = :val${index}`).join(', ')}`,
      ExpressionAttributeNames: Object.keys(updateData).reduce((acc, key) => {
        acc[`#${key}`] = key
        return acc
      }, {} as Record<string, string>),
      ExpressionAttributeValues: Object.keys(updateData).reduce((acc, key, index) => {
        acc[`:val${index}`] = updateData[key]
        return acc
      }, {} as Record<string, any>),
    })

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      updatedFields: Object.keys(updateData)
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}