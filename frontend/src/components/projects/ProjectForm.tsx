import type { FormEvent } from 'react'

type ProjectFormProps = { onCancel: () => void; onSubmit: (name: string) => void; pending: boolean; error?: string }

export default function ProjectForm({ onCancel, onSubmit, pending, error }: ProjectFormProps) {

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const form = event.currentTarget
    const nameInput = form.elements.namedItem('projectName') as HTMLInputElement
    nameInput.setCustomValidity(nameInput.value.trim() ? '' : 'Enter a project name.')
    if (!form.reportValidity()) return
    onSubmit(nameInput.value.trim())
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="field"><label htmlFor="project-name">Project name</label><input id="project-name" name="projectName" required maxLength={200} placeholder="Give your project a name" onInput={event => event.currentTarget.setCustomValidity('')} /></div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="form-actions"><button className="button button-secondary" type="button" disabled={pending} onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit" disabled={pending}>{pending ? 'Creating…' : 'Create Project'}</button></div>
    </form>
  )
}
