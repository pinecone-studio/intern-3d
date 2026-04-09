import { Download, Eye, FileText } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/status-badge'
import type { Document } from '@/lib/types'
import { actionLabels, phaseLabels } from '@/lib/mock-configs'

type DocumentTableProps = {
  documents: Document[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DocumentTable({ documents }: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground" strokeWidth={1.6} />
        <h3 className="text-lg font-medium">Баримт олдсонгүй</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Хайлтын эсвэл шүүлтийн нөхцлөө өөрчлөөд үзнэ үү.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Файлын нэр</TableHead>
          <TableHead>Ажилтан</TableHead>
          <TableHead>Үйлдэл</TableHead>
          <TableHead>Үе шат</TableHead>
          <TableHead>Үүсгэсэн огноо</TableHead>
          <TableHead>Төлөв</TableHead>
          <TableHead className="text-right">Үйлдэл</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                <span className="font-medium">{doc.filename}</span>
                <Badge variant="outline" className="text-xs uppercase">
                  {doc.fileType}
                </Badge>
              </div>
            </TableCell>
            <TableCell>{doc.employeeName}</TableCell>
            <TableCell>{actionLabels[doc.action]}</TableCell>
            <TableCell>
              <Badge variant="secondary">{phaseLabels[doc.phase]}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDate(doc.generatedDate)}
            </TableCell>
            <TableCell>
              <StatusBadge status={doc.status} />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Харах"
                >
                  <Eye className="h-4 w-4" strokeWidth={1.8} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Татах"
                >
                  <Download className="h-4 w-4" strokeWidth={1.8} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
