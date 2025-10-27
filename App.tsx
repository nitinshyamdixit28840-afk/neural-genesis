
import React, { useState, ReactNode } from 'react';
import { Page } from './types';
import { DashboardPage, EvolutionViewPage, ModelLibraryPage, DeploymentHubPage, ResearchAssistantPage } from './pages';
import { DashboardIcon, EvolutionIcon, LibraryIcon, DeployIcon, AssistantIcon } from './components';

// ==== Sidebar Component ==== //

const navItems = [
    { page: Page.Dashboard, icon: DashboardIcon },
    { page: Page.EvolutionView, icon: EvolutionIcon },
    { page: Page.ModelLibrary, icon: LibraryIcon },
    { page: Page.DeploymentHub, icon: DeployIcon },
    { page: Page.ResearchAssistant, icon: AssistantIcon },
];

interface SidebarProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
    return (
        <aside className="bg-gray-900/30 backdrop-blur-md border-r border-slate-800 w-20 flex flex-col items-center py-6 space-y-6">
            <div className="text-cyan-400 font-black text-2xl">
                N<span className="text-white">G</span>
            </div>
            <nav className="flex flex-col items-center space-y-4">
                {navItems.map(({ page, icon: Icon }) => (
                    <button
                        key={page}
                        onClick={() => setActivePage(page)}
                        className={`p-3 rounded-lg transition-all duration-200 group relative ${activePage === page ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
                        aria-label={page}
                    >
                        <Icon className="h-6 w-6" />
                        <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {page}
                        </span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

// ==== Main App Component ==== //

const App: React.FC = () => {
    const [activePage, setActivePage] = useState<Page>(Page.Dashboard);

    const renderPage = (): ReactNode => {
        switch (activePage) {
            case Page.Dashboard:
                return <DashboardPage />;
            case Page.EvolutionView:
                return <EvolutionViewPage />;
            case Page.ModelLibrary:
                return <ModelLibraryPage />;
            case Page.DeploymentHub:
                return <DeploymentHubPage />;
            case Page.ResearchAssistant:
                return <ResearchAssistantPage />;
            default:
                return <DashboardPage />;
        }
    };

    return (
        <div className="flex h-screen bg-dots-pattern">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <main className="flex-1 overflow-y-auto">
                {renderPage()}
            </main>
            <style>{`
                .bg-dots-pattern {
                    background-image: radial-gradient(#1e293b 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    );
};

export default App;
