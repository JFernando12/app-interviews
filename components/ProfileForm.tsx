'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ProfileData {
  id: string
  name: string
  email: string
  image: string
  role: string
  description: string
}

export default function ProfileForm() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Cargar datos del perfil
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data.user)
          setDescription(data.user.description || '')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      })

      if (response.ok) {
        setMessage('✅ Profile updated successfully!')
        // Actualizar la sesión para reflejar los cambios
        await update()
        // Actualizar el estado local
        if (profile) {
          setProfile({ ...profile, description })
        }
      } else {
        const error = await response.json()
        setMessage(`❌ Error: ${error.error}`)
      }
    } catch (error) {
      setMessage('❌ Network error occurred')
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Unable to load profile data</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        {profile.image && (
          <img
            src={profile.image}
            alt={profile.name}
            className="w-20 h-20 rounded-full mx-auto mb-4"
          />
        )}
        <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
        <p className="text-gray-600">{profile.email}</p>
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
          {profile.role}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Professional Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Backend Developer, Frontend Developer, Full Stack Engineer..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/100 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition duration-200"
        >
          {isSaving ? 'Saving...' : 'Update Profile'}
        </button>
      </form>

      {message && (
        <div className="mt-4 p-3 rounded-md text-sm">
          <p className={message.includes('✅') ? 'text-green-700' : 'text-red-700'}>
            {message}
          </p>
        </div>
      )}
    </div>
  )
}