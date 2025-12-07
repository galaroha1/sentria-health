import { Shield, ExternalLink, AlertCircle, FileText, Database, Info } from 'lucide-react';

interface PadResource {
    id: string;
    name: string;
    description: string;
    offerings: string;
    limitations: string;
    url?: string;
    icon: any;
}

export function Compliance() {
    const resources: PadResource[] = [
        {
            id: 'macpac',
            name: 'MACPAC (Medicaid and CHIP Payment and Access Commission)',
            description: 'Physician-Administered Drugs Policy Framework',
            offerings: 'Overview of what PADs are; clarifies that "states may maintain a list ... which drugs are considered physician-administered drugs."',
            limitations: 'Does not provide a universal list — only explains the policy framework and notes variability by state.',
            url: 'https://www.macpac.gov',
            icon: FileText
        },
        {
            id: 'medi-cal',
            name: 'Medi-Cal Rx (California)',
            description: 'Appendix H – List of Physician-Administered Drugs',
            offerings: 'A published PAD list (with drugs excluded from pharmacy benefit and requiring medical-benefit billing) for California, including drug names, codes, etc.',
            limitations: 'Limited to California’s Medicaid program. Other states have different PAD lists.',
            url: 'https://medi-calrx.dhcs.ca.gov',
            icon: Database
        },
        {
            id: 'emedny',
            name: 'eMedNY (New York State)',
            description: 'Practitioner Administered Drug (PAD) Search Tool',
            offerings: 'A searchable list of "practitioner-administered drugs" (non-vaccine) that can be billed via medical benefit using HCPCS + NDC.',
            limitations: 'Limited to New York Medicaid / eMedNY population. Not comprehensive for entire U.S.',
            url: 'https://www.emedny.org',
            icon: SearchIcon
        },
        {
            id: 'cms',
            name: 'CMS / Medicaid (Federal)',
            description: 'Physician-Administered Drugs (PAD) Resources',
            offerings: 'Provides guidance, policy definitions, and links to state plans; some public data sets for Medicaid reimbursements.',
            limitations: 'Not a unified "drug catalogue" — mostly policy / coverage info, and many PADs are administered under varying state programs.',
            url: 'https://data.medicaid.gov',
            icon: Shield
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900">Regulatory & Compliance</h1>
                <p className="text-slate-600">
                    Centralized repository for Physician-Administered Drug (PAD) policies, state-specific lists, and billing guidelines.
                </p>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
                    <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 text-blue-600">
                        <Info className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">PAD Definition</h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Drugs administered by a physician or other professional in a clinical setting (e.g., injectable, infusion), often billed under the medical benefit (J-Codes) rather than pharmacy benefit.
                    </p>
                </div>

                <div className="rounded-xl border border-amber-100 bg-amber-50 p-6">
                    <div className="mb-4 inline-flex rounded-lg bg-amber-100 p-3 text-amber-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">State Variability</h3>
                    <p className="mt-2 text-sm text-slate-600">
                        PAD lists differ significantly by state. A drug covered as a medical benefit in CA (Medi-Cal) may be a pharmacy benefit in NY (eMedNY).
                    </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6">
                    <div className="mb-4 inline-flex rounded-lg bg-emerald-100 p-3 text-emerald-600">
                        <Database className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Data Sources</h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Sentria integrates with 4+ major regulatory data streams to provide real-time compliance checks for procurement.
                    </p>
                </div>
            </div>

            {/* Resource Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                    <h2 className="text-lg font-bold text-slate-900">Official Data Sources & Resources</h2>
                    <p className="text-sm text-slate-500">
                        Detailed breakdown of integrated regulatory frameworks.
                    </p>
                </div>
                <div className="divide-y divide-slate-100">
                    {resources.map((resource) => (
                        <div key={resource.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                    <resource.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                {resource.name}
                                                <ExternalLink className="h-3 w-3 text-slate-400" />
                                            </h3>
                                            <p className="text-sm font-medium text-slate-600">{resource.description}</p>
                                        </div>
                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-800">
                                            {resource.id === 'cms' || resource.id === 'macpac' ? 'Federal / National' : 'State Specific'}
                                        </span>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-600">What It Offers</p>
                                            <p className="text-sm text-slate-700">{resource.offerings}</p>
                                        </div>
                                        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-600">Limitations / What to Know</p>
                                            <p className="text-sm text-slate-700">{resource.limitations}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SearchIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}
