'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Upload, FileText, Link as LinkIcon, ArrowLeft, Check } from 'lucide-react'

type SourceType = 'UPLOAD' | 'TEXT' | 'URL'

export default function NewAnalysisPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [sourceType, setSourceType] = useState<SourceType | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSourceSelect = (type: SourceType) => {
    setSourceType(type)
    setStep(2)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain']
      if (!validTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload JPG, PNG, PDF, or TXT files.')
        return
      }

      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File too large. Maximum size is 10MB.')
        return
      }

      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async () => {
    setError('')
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('source_type', sourceType!)

      if (sourceType === 'UPLOAD' && file) {
        formData.append('file', file)
      } else if (sourceType === 'TEXT') {
        if (!text.trim()) {
          setError('Please enter some text to analyze')
          setIsLoading(false)
          return
        }
        formData.append('text', text)
      } else if (sourceType === 'URL') {
        if (!url.trim() || !url.startsWith('http')) {
          setError('Please enter a valid URL')
          setIsLoading(false)
          return
        }
        formData.append('url', url)
      }

      const response = await fetch('/api/analyses', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create analysis')
      }

      // Redirect to the analysis page
      if (data.analysis?.id) {
        router.push(`/analyses/${data.analysis.id}`)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmit = () => {
    if (sourceType === 'UPLOAD') return file !== null
    if (sourceType === 'TEXT') return text.trim().length > 0
    if (sourceType === 'URL') return url.trim().length > 0
    return false
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => step === 1 ? router.back() : setStep(1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>

          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold">New Analysis</h1>
              <p className="text-gray-600">
                {step === 1
                  ? 'Choose how you want to provide your document'
                  : 'Provide your document content'}
              </p>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleSourceSelect('UPLOAD')}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
                  >
                    <Upload className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                    <h3 className="font-medium mb-1">Upload File</h3>
                    <p className="text-sm text-gray-500">PDF, JPG, PNG, or TXT</p>
                  </button>

                  <button
                    onClick={() => handleSourceSelect('TEXT')}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
                  >
                    <FileText className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                    <h3 className="font-medium mb-1">Paste Text</h3>
                    <p className="text-sm text-gray-500">Copy and paste content</p>
                  </button>

                  <button
                    onClick={() => handleSourceSelect('URL')}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
                  >
                    <LinkIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                    <h3 className="font-medium mb-1">From URL</h3>
                    <p className="text-sm text-gray-500">Fetch from web page</p>
                  </button>
                </div>
              )}

              {step === 2 && sourceType === 'UPLOAD' && (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {file ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Check className="h-5 w-5 text-success-600" />
                        <span className="text-gray-900">{file.name}</span>
                        <button
                          onClick={() => setFile(null)}
                          className="text-sm text-gray-500 hover:text-danger-600"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2">
                          Drag and drop or click to upload
                        </p>
                        <p className="text-sm text-gray-500">
                          PDF, JPG, PNG, or TXT up to 10MB
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.txt"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ position: 'absolute' }}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.txt"
                      onChange={handleFileChange}
                      className="mt-4 w-full"
                    />
                  </div>
                </div>
              )}

              {step === 2 && sourceType === 'TEXT' && (
                <div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste the content of your bill, estimate, or contract here..."
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {text.length} characters
                  </p>
                </div>
              )}

              {step === 2 && sourceType === 'URL' && (
                <div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/document"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter the URL of the page containing your document
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    disabled={!canSubmit()}
                  >
                    Analyze Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
