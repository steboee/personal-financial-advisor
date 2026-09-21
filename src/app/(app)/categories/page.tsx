import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BUCKET_ORDER } from '@/lib/finance/buckets'
import { getDictionary } from '@/i18n/dictionaries'
import { t } from '@/i18n/format'
import { getCategories } from '@/lib/finance/queries'

export const metadata = { title: 'Categories · Financial Advisor' }

export default async function CategoriesPage() {
  const [categories, dict] = await Promise.all([getCategories(), getDictionary()])
  const c = dict.categories

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{c.title}</h1>
        <p className="text-sm text-muted-foreground">
          {c.subtitle}
        </p>
      </div>

      <div className="grid gap-4 @3xl/main:grid-cols-3">
        {BUCKET_ORDER.map((bucket) => {
          const items = categories.filter(
            (c) => c.bucket === bucket && !c.is_income && !c.is_transfer
          )
          return (
            <Card key={bucket}>
              <CardHeader>
                <CardTitle>{dict.buckets[bucket]}</CardTitle>
                <CardDescription>
                  {t(items.length === 1 ? c.countOne : c.countMany, { count: items.length })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <Badge key={item.id} variant="secondary">
                    {item.name}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{c.allTitle}</CardTitle>
          <CardDescription>
            {c.allDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{c.columns.name}</TableHead>
                <TableHead className="w-28">{c.columns.bucket}</TableHead>
                <TableHead className="w-28">{c.columns.type}</TableHead>
                <TableHead>{c.columns.keywords}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{dict.buckets[cat.bucket]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {cat.is_income
                      ? c.types.income
                      : cat.is_transfer
                        ? c.types.transfer
                        : c.types.expense}
                  </TableCell>
                  <TableCell className="max-w-0 truncate text-xs text-muted-foreground">
                    {cat.keywords?.join(', ') || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
