import { PageTransition } from '@/components/ui/page-transition'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { CreatePlanForm } from './create-plan-form'

export const metadata = {
    title: 'Nuevo Plan Nutricional | Fitness Bassi',
}

export default function CreatePlanPage() {
    return (
        <PageTransition>
            <div className="p-6 xl:p-8 w-full max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/nutrition-plans"
                        className="p-2 -ml-2 hover:bg-[var(--bg-elevated)] rounded-full transition-colors text-[var(--accent)]"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl xl:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                            Crear Plan
                        </h1>
                        <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                            Calculadora en tiempo real
                        </p>
                    </div>
                </div>

                <CreatePlanForm />
            </div>
        </PageTransition>
    )
}
