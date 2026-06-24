import axios from "axios"
import { useState } from "react"

export default function FileUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState("")

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const { data } = await axios.post(
        "http://localhost:8000/upload", formData
      )
      setFileName(file.name)
      onUpload(data.message)
    } catch (err) {
      alert("Upload failed. Is the backend running?")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
      <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
        {uploading ? "Processing..." : "Upload PDF"}
        <input type="file" accept=".pdf"
          onChange={handleFile} className="hidden" />
      </label>
      {fileName && (
        <span className="text-sm text-gray-600">
          ✅ {fileName}
        </span>
      )}
    </div>
  )
}