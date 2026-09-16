import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  createListing,
  getListingById,
  updateListing,
} from '../api/listings'
import { openImageUploadWidget } from '../utils/cloudinary'
import { CATEGORIES } from '../utils/categories'
import { LOCATIONS, REGIONS } from '../utils/locations'
import { CONDITIONS } from '../utils/conditions'
import Spinner from '../components/Spinner'

const EMPTY_FORM = {
  type: CATEGORIES[0],
  brand: '',
  size: '',
  condition: CONDITIONS[0],
  estimatedValue: '',
  region: REGIONS[0],
  city: LOCATIONS[REGIONS[0]][0],
  availability: 'available',
}

function CreateEditListing() {
  const { itemId } = useParams()
  const isEditMode = Boolean(itemId)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!isEditMode) return
    let cancelled = false

    getListingById(itemId)
      .then((data) => {
        if (cancelled) return
        setForm({
          type: data.type || EMPTY_FORM.type,
          brand: data.brand || '',
          size: data.size || '',
          condition: data.condition || EMPTY_FORM.condition,
          estimatedValue: data.estimatedValue ?? '',
          city: data.city || EMPTY_FORM.city,
          region: data.region || EMPTY_FORM.region,
          availability: data.availability || EMPTY_FORM.availability,
        })
        setImages(data.images || [])
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load this listing.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [itemId, isEditMode])

  function handleChange(e) {
    const { name, value } = e.target
    if (name === 'region') {
      setForm((prev) => ({ ...prev, region: value, city: LOCATIONS[value][0] }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleUploadClick() {
    openImageUploadWidget({
      onStart: () => setUploading(true),
      onSuccess: (url) => setImages((prev) => [...prev, url]),
      onFinish: () => setUploading(false),
      onError: (message) => {
        setUploading(false)
        toast.error(message || 'Image upload failed.')
      },
    })
  }

  function removeImage(url) {
    setImages((prev) => prev.filter((img) => img !== url))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    const { availability, ...rest } = form
    const payload = {
      ...rest,
      estimatedValue: Number(form.estimatedValue),
      images,
      ...(isEditMode ? { availability } : {}),
    }

    try {
      const result = isEditMode
        ? await updateListing(itemId, payload)
        : await createListing(payload)

      toast.success(isEditMode ? 'Listing updated' : 'Listing created')
      const resultId = result?.id || itemId
      navigate(`/listings/${resultId}`)
    } catch (err) {
      const message = err.response?.data?.error
      toast.error(message || 'Failed to save listing.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12 flex justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <nav className="mb-4 text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">
            {isEditMode ? 'Edit Listing' : 'New Listing'}
          </span>
        </nav>

        <div className="rounded-2xl bg-white p-8 shadow-lg shadow-primary/10 border border-secondary/30">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {isEditMode ? 'Edit Listing' : 'Create New Listing'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Brand
              </label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Size
              </label>
              <input
                name="size"
                value={form.size}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Condition
              </label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Estimated Value ($)
              </label>
              <input
                name="estimatedValue"
                type="number"
                min="0"
                step="0.01"
                value={form.estimatedValue}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {isEditMode ? (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Availability
                </label>
                <select
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            ) : (
              <div />
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Region
              </label>
              <select
                name="region"
                value={form.region}
                onChange={handleChange}
                className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                City
              </label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {(LOCATIONS[form.region] || []).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Images
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((url) => (
                <div key={url} className="relative h-20 w-20">
                  <img
                    src={url}
                    alt="Listing"
                    className="h-full w-full rounded-lg object-cover border border-secondary/30"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gray-800 text-xs text-white leading-5 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg border border-accent px-4 py-2 text-sm font-semibold text-accent hover:bg-accent-mist transition-colors disabled:opacity-60 cursor-pointer"
            >
              {uploading ? (
                <Spinner size="sm" />
              ) : (
                'Upload Images'
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-secondary transition-colors disabled:opacity-60 cursor-pointer"
          >
            {submitting
              ? 'Saving…'
              : isEditMode
                ? 'Save Changes'
                : 'Create Listing'}
          </button>
        </form>
        </div>
      </div>
    </div>
  )
}

export default CreateEditListing
