import Link from 'next/link'
import { UploadIcon } from 'lucide-react'

import { BucketRuleCard } from '@/components/bucket-rule-card'
import { SectionCards } from '@/components/section-cards'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { amountColor } from '@/lib/finance/colors'
import { formatDateShort, formatSigned, monthKey } from '@/lib/finance/format'
import { getTransactions } from '@/lib/finance/queries'
import { summarize } from '@/lib/finance/summary'
import { getDictionary } from '@/i18n/dictionaries'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams
  const current = month ?? monthKey(new Date())

  const [transactions, dict] = await Promise.all([
    getTransactions({ month: current }),
    getDictionary(),
  ])

  const summary = summarize(
    transactions.map((t) => ({
      amount: t.amount,
      bucket: t.category?.bucket ?? null,
      isIncome: t.category?.is_income ?? false,
      isTransfer: t.category?.is_transfer ?? false,
    }))
  )

  if (transactions.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{dict.dashboard.emptyTitle}</CardTitle>
            <CardDescription>{dict.dashboard.emptyBody}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/import" />}>
              <UploadIcon />
              {dict.dashboard.emptyAction}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards summary={summary} dict={dict} />

      <div className="grid gap-4 px-4 lg:px-6 @5xl/main:grid-cols-2">
        <BucketRuleCard buckets={summary.buckets} income={summary.income} dict={dict} />

        <Card>
          <CardHeader>
            <CardTitle>{dict.dashboard.recent.title}</CardTitle>
            <CardDescription>{dict.dashboard.recent.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dict.transactions.columns.date}</TableHead>
                  <TableHead>{dict.transactions.columns.description}</TableHead>
                  <TableHead className="text-right">{dict.transactions.columns.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 8).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDateShort(t.booked_at)}
                    </TableCell>
                    <TableCell className="max-w-[16rem] truncate">{t.description}</TableCell>
                    <TableCell
                      className={`text-right font-medium tabular-nums ${amountColor(t.amount)}`}
                    >
                      {formatSigned(t.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" className="mt-4 w-full" render={<Link href="/transactions" />}>
              {dict.dashboard.recent.viewAll}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
