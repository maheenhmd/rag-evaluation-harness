import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'

type Props = { onUpload: (file: File) => Promise<void>; pending: boolean; disabled?: boolean; error?: string }

export default function DocumentUpload({ onUpload, pending, disabled = false, error: uploadError }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  function selectFile(selected?: File) {
    if (pending || disabled) return
    setMessage('')
    setError('')
    setFile(null)
    if (!selected) return
    if (!selected.name.endsWith('.txt')) {
      setError('Only .txt files are supported. Choose a plain-text document.')
      if (input.current) input.current.value = ''
      return
    }
    if (!selected.size) {
      setError('This file is empty. Choose a .txt file that contains text.')
      if (input.current) input.current.value = ''
      return
    }
    setFile(selected)
  }

  async function upload() {
    if (!file || pending || disabled) return
    setMessage('')
    try {
      await onUpload(file)
      setMessage(`${file.name} uploaded successfully.`)
      setFile(null)
      if (input.current) input.current.value = ''
    } catch {
      // The parent mutation displays a readable API error. Keep the file selected.
    }
  }

  return (
    <div className="upload-component">
      <div className={`upload-zone ${dragging ? 'is-dragging' : ''}`}
        onDragOver={event => { event.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={event => { event.preventDefault(); setDragging(false); if (pending || disabled) return; if (event.dataTransfer.files.length > 1) { setError('Select one .txt file at a time.'); setFile(null); return } selectFile(event.dataTransfer.files[0]) }}>
        <Upload size={25} strokeWidth={1.5} aria-hidden="true" />
        <h3>Bring your source documents.</h3>
        <p>Drag a .txt file here, or choose one from your device.</p>
        <label className="button button-secondary file-picker">Choose .txt file<input ref={input} type="file" accept=".txt,text/plain" disabled={pending || disabled} onChange={event => selectFile(event.currentTarget.files?.[0])} /></label>
        <p className="small-note">Upload a non-empty UTF-8 text file with a lowercase .txt extension.</p>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      {uploadError && <p className="field-error" role="alert">{uploadError}</p>}
      {file && <div className="selected-file"><div><strong>{file.name}</strong><p>{file.size.toLocaleString()} bytes · Ready to upload</p></div><button className="icon-button" disabled={pending || disabled} onClick={() => { setFile(null); setMessage(''); if (input.current) input.current.value = '' }} aria-label="Remove selected file"><X size={18} aria-hidden="true" /></button></div>}
      <div className="upload-action"><button className="button button-primary" disabled={!file || pending || disabled} onClick={upload}>{pending ? 'Uploading and processing…' : 'Upload document'}</button><p className="form-status" role="status">{message}</p></div>
    </div>
  )
}
