'use client'

import { useState } from 'react'
import {
  Check,
  Database,
  FileText,
  Loader2,
  Mail,
  Play,
  Upload,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const demoSteps = [
  {
    id: 1,
    icon: Play,
    label: 'Шинэ ажилтан бүртгэгдсэн',
    detail: 'Бат Тэмүүлэн Инженерчлэлийн хэлтэст орсон',
  },
  {
    id: 2,
    icon: FileText,
    label: 'Үйлдлийг тодорхойлсон',
    detail: 'Ажилтан нэмэх үйлдэл идэвхжив',
  },
  {
    id: 3,
    icon: FileText,
    label: '4 баримт үүсгэсэн',
    detail: 'Хөдөлмөрийн гэрээ, туршилтын хугацааны тушаал, ажлын байрны тодорхойлолт, нууцлалын гэрээ',
  },
  {
    id: 4,
    icon: Upload,
    label: 'Баримтуудыг байршуулсан',
    detail: '/ажилтан/emp-001/ажилд-авах/ замд хадгалсан',
  },
  {
    id: 5,
    icon: Mail,
    label: 'Мэдэгдлүүдийг илгээсэн',
    detail: 'Хүний нөөцийн баг, хэлтсийн дарга, салбарын менежер',
  },
  {
    id: 6,
    icon: Database,
    label: 'Аудитын бүртгэл хадгалагдсан',
    detail: 'Аудитын мөр үүсгэсэн',
  },
]

export function DemoFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const runDemo = () => {
    setCurrentStep(0)
    setIsRunning(true)
    let step = 0
    const interval = setInterval(() => {
      step++
      setCurrentStep(step)
      if (step >= demoSteps.length) {
        clearInterval(interval)
        setIsRunning(false)
      }
    }, 800)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Ажилтан нэмэх жишээ
              <Badge className="bg-primary text-primary-foreground">Онцлох</Badge>
            </CardTitle>
            <CardDescription>
              Ажилтан нэмэх бүрэн урсгалыг ажиглана уу
            </CardDescription>
          </div>
          <Button onClick={runDemo} disabled={isRunning} size="sm">
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Ажиллаж байна...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" strokeWidth={1.8} />
                Жишээ ажиллуулах
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {demoSteps.map((step) => {
            const Icon = step.icon
            const isComplete = currentStep >= step.id
            const isCurrent = currentStep === step.id && isRunning
            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-3 rounded-md p-2 transition-colors',
                  isComplete ? 'bg-secondary/50' : 'opacity-50'
                )}
              >
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full',
                    isComplete ? 'bg-secondary text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {isCurrent ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isComplete ? (
                    <Check className="h-4 w-4" strokeWidth={1.8} />
                  ) : (
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
