'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileJsonIcon, Loader2Icon, UploadIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { importTransactions, type ImportResult } from '../actions'

export function ImportForm({
  labels,
}: {
  labels: {
    drop: string
    formats: string
    choose: string
    submit: string
    importing: string
    noFile: string
    wrongType: string
  }
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  function submit() {
    if (!file) {
      toast.error(labels.noFile)
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    startTransition(async () => {
      const res = await importTransactions(formData)
      setResult(res)

      if (res.ok) {
        toast.success(res.message)
        setFile(null)
        if (inputRef.current) inputRef.current.value = ''
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  function choose(next: File | undefined) {
    if (!next) return
    const name = next.name.toLowerCase()
    if (!name.endsWith('.json') && !name.endsWith('.csv')) {
      toast.error(labels.wrongType)
      return
    }
    setFile(next)
    setResult(null)
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          choose(e.dataTransfer.files[0])
        }}
        className={`rounded-2xl border border-dashed p-8 text-center transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-border'
        }`}
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          {file ? (
            <FileJsonIcon className="size-5 text-primary" />
          ) : (
            <UploadIcon className="size-5 text-muted-foreground" />
          )}
        </div>

        <p className="mt-4 text-sm font-medium">
          {file ? file.name : labels.drop}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {labels.formats}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".json,.csv,application/json,text/csv"
          className="sr-only"
          onChange={(e) => choose(e.target.files?.[0])}
        />

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={pending}>
            {labels.choose}
          </Button>
          <Button onClick={submit} disabled={!file || pending}>
            {pending ? (
              <>
                <Loader2Icon className="animate-spin" />
                {labels.importing}
              </>
            ) : (
              labels.submit
            )}
          </Button>
        </div>
      </div>

      {/* The toast is transient; this keeps the outcome on screen. */}
      {result && (
        <div
          role="status"
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            result.ok ? 'bg-muted' : 'border-destructive/30 bg-destructive/10 text-destructive'
          }`}
        >
          <p>{result.message}</p>
          {result.errors && result.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs">
              {result.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
