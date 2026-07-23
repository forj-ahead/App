import { NewClientForm } from '@/components/new-client-form'

export default function NewClientPage() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Onboard New Client</h1>
        <p className="text-white/40 text-sm">Fill in what you know — the agent will be created automatically.</p>
      </div>
      <NewClientForm />
    </div>
  )
}
