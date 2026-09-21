import { ImportForm } from './_components/import-form'
import { getDictionary } from '@/i18n/dictionaries'

export const metadata = { title: 'Import · Financial Advisor' }

export default async function ImportPage() {
  const dict = await getDictionary()
  const i = dict.import

  return (
    <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">{i.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {i.subtitle}
      </p>

      <div className="mt-8">
        <ImportForm
          labels={{
            drop: i.drop,
            formats: i.formats,
            choose: i.choose,
            submit: i.submit,
            importing: i.importing,
            noFile: i.errors.noFile,
            wrongType: i.errors.wrongType,
          }}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-base font-semibold">{i.helpTitle}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>{i.step1}</li>
          <li>{i.step2}</li>
          <li>{i.step3}</li>
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          {i.helpNote}
        </p>
      </section>
    </div>
  )
}
