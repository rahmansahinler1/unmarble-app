const API_BASE_URL = import.meta.env.VITE_API_URL

async function fetchWithAuth(url, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  const response = await fetch(url, { ...defaultOptions, ...options })

  if (response.status === 401) {
    const domain = import.meta.env.VITE_COOKIE_DOMAIN
    document.cookie = `authToken=; domain=${domain}; path=/; max-age=0`
    window.location.href = import.meta.env.VITE_WEBSITE_URL
    throw new Error('Authentication required')
  }

  return response
}

export const healthCheck = async function () {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Health check failed:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const getUser = async function () {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/get_user`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Failed to get user:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const getPreviews = async function () {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/get_previews`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Failed to get previews:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const getImage = async function (imageId) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/get_image`, {
      method: 'POST',
      body: JSON.stringify({ image_id: imageId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Failed to fetch image:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const getDesign = async function (imageId) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/get_design`, {
      method: 'POST',
      body: JSON.stringify({ image_id: imageId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Failed to fetch design:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const uploadImage = async function (category, imageBase64) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/upload_image`, {
      method: 'POST',
      body: JSON.stringify({
        category: category,
        imageBase64: imageBase64,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Failed to upload file:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const updateDesignFav = async function (imageId) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/update_design_fav`, {
      method: 'POST',
      body: JSON.stringify({ image_id: imageId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to update fav:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const updateImageFav = async function (imageId) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/update_image_fav`, {
      method: 'POST',
      body: JSON.stringify({ image_id: imageId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to update image fav:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const deleteImage = async function (imageId) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/delete_image`, {
      method: 'POST',
      body: JSON.stringify({ image_id: imageId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Failed to delete image:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const deleteDesign = async function (imageId) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/delete_design`, {
      method: 'POST',
      body: JSON.stringify({ image_id: imageId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Failed to delete design:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const designImage = async function (yourselfImageId, clothingImageId) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/design_image`, {
      method: 'POST',
      body: JSON.stringify({
        yourself_image_id: yourselfImageId,
        clothing_image_id: clothingImageId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Failed to design image:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const submitFeedback = async function (message) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/submit_feedback`, {
      method: 'POST',
      body: JSON.stringify({ message: message }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Failed to submit feedback:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}
