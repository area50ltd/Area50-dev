import { db } from '@/lib/db'
import { companies } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { WidgetClientWrapper } from './WidgetClientWrapper'

interface Props {
  searchParams: { company_id?: string }
}

export default async function WidgetPage({ searchParams }: Props) {
  const companyId = searchParams.company_id

  if (!companyId) {
    return (
      <div className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-neutral-300 flex items-center justify-center text-white text-xs font-bold">
        !
      </div>
    )
  }

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
  })

  if (!company) {
    return (
      <div className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-red-400 flex items-center justify-center text-white text-xs font-bold">
        ?
      </div>
    )
  }

  return <WidgetClientWrapper company={company} />
}
