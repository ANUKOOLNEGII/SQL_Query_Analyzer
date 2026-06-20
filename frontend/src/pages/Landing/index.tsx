import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { 
  Sparkles, 
  UploadCloud, 
  Database, 
  Terminal, 
  Download, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  GraduationCap
} from 'lucide-react';

export const Landing: React.FC = () => {
  const features = [
    {
      icon: <Sparkles className="text-accent-light dark:text-accent-dark h-7 w-7" />,
      title: 'AI SQL Generation',
      desc: 'Convert simple English instructions into precise, production-ready SQL queries instantly using advanced LLMs.'
    },
    {
      icon: <UploadCloud className="text-primary-light dark:text-primary-dark h-7 w-7" />,
      title: 'CSV File Upload',
      desc: 'Upload standard CSV files to automatically generate SQL schemas and query against tables without databases.'
    },
    {
      icon: <Database className="text-secondary-light dark:text-secondary-dark h-7 w-7" />,
      title: 'Database Integration',
      desc: 'Connect directly to external database hosts (PostgreSQL, MySQL) safely and securely using encrypted credentials.'
    },
    {
      icon: <Terminal className="text-accent-light dark:text-accent-dark h-7 w-7" />,
      title: 'Interactive Code Workspace',
      desc: 'Edit, format, copy, and download generated SQL statements with auto syntax highlighting in a developer-friendly console.'
    },
    {
      icon: <ShieldCheck className="text-success h-7 w-7" />,
      title: 'Query Safety & Validation',
      desc: 'Restricted commands guard database security. Queries are validated for syntax errors before running.'
    },
    {
      icon: <Download className="text-secondary-light dark:text-secondary-dark h-7 w-7" />,
      title: 'Multi-Format Export',
      desc: 'Export structured data results to Excel, CSV, or formatted ASCII PDF files with a single click.'
    }
  ];

  const workflowSteps = [
    { num: '1', title: 'Connect Data', desc: 'Drag-and-drop a CSV file or fill database credentials to map your schema context.' },
    { num: '2', title: 'Ask in English', desc: 'Type your data request like "Show top 5 earning sales reps from the West region".' },
    { num: '3', title: 'Get SQL & Explanations', desc: 'AI builds the optimized SQL query, maps the schemas, and explains each command.' },
    { num: '4', title: 'Execute & Export', desc: 'Run the query safely, inspect the tabular results, and export into standard formats.' }
  ];

  const testimonials = [
    {
      quote: "As a product manager with zero SQL experience, I can now pull my own metrics without waiting on dev cycles. SQLGenius is a game-changer.",
      author: "Sarah Jenkins",
      role: "Product Manager at LinearTech"
    },
    {
      quote: "The explanations section makes this an incredible teaching tool. My students understand *why* a query joins instead of just copy-pasting.",
      author: "Dr. Marcus Vance",
      role: "Database Systems Professor"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-200">
      {/* Public Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(15,118,110,0.1),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.05),transparent_50%)] pointer-events-none" />
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Banner badge */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-primary-light dark:text-primary-dark rounded-full text-xs font-semibold border border-teal-100 dark:border-teal-900/40 mb-6">
              <Sparkles size={12} />
              <span>Next-Gen NL-to-SQL Analytics</span>
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark sm:text-6xl md:text-7xl leading-[1.1] font-sans">
              Generate SQL Queries Using <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark">Natural Language</span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-text-secondaryLight dark:text-text-secondaryDark max-w-2xl mx-auto leading-relaxed">
              Transform plain English into production-ready SQL using AI-powered intelligence. Query, explain, and export tabular data instantly.
            </p>
            
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button variant="primary" size="lg" className="shadow-lg hover:shadow-xl group">
                  <span>Get Started Free</span>
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </a>
            </div>
          </div>

          {/* Interactive UI Mockup Dashboard */}
          <div className="mt-16 border border-border-light dark:border-border-dark shadow-modal rounded-card overflow-hidden bg-surface-light dark:bg-surface-dark max-w-5xl mx-auto p-4 transition-all duration-300">
            <div className="flex items-center space-x-2 pb-3.5 border-b border-border-light dark:border-border-dark mb-4">
              <div className="w-3.5 h-3.5 bg-red-400 rounded-full" />
              <div className="w-3.5 h-3.5 bg-yellow-400 rounded-full" />
              <div className="w-3.5 h-3.5 bg-green-400 rounded-full" />
              <span className="text-xs text-text-secondaryLight dark:text-text-secondaryDark ml-4 font-semibold">sql_generator_workspace.sql</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="text-sm font-semibold text-text-primaryLight dark:text-text-primaryDark">Natural Language Request</div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-bg-light dark:bg-bg-dark font-medium text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  "Show all customers from California who ordered more than $500 of product this quarter, sorted by sales descending"
                </div>
                <div className="flex items-center space-x-3.5 pt-2">
                  <div className="h-2 bg-teal-500 rounded-full w-2 animate-ping" />
                  <span className="text-xs text-text-secondaryLight dark:text-text-secondaryDark font-medium">Schema Matched: customers (state, sales, order_date)</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-sm font-semibold text-text-primaryLight dark:text-text-primaryDark">AI Generated SQL (Syntax OK)</div>
                <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner border border-slate-900">
{`SELECT *
FROM customers
WHERE state = 'CA' 
  AND sales_amount > 500 
  AND order_date >= '2026-04-01'
ORDER BY sales_amount DESC;`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-surface-light dark:bg-surface-dark transition-colors duration-200">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark sm:text-4xl">
              Enterprise-Grade Capabilities
            </h2>
            <p className="mt-4 text-base text-text-secondaryLight dark:text-text-secondaryDark max-w-xl mx-auto">
              Everything you need to map schemas, generate verified queries, and export reports in a clean, visual console.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Card key={i} className="flex flex-col items-start text-left p-8">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-text-primaryLight dark:text-text-primaryDark mb-3">
                  {f.title}
                </h3>
                <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark leading-relaxed flex-1">
                  {f.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-bg-light dark:bg-bg-dark transition-colors duration-200">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark sm:text-4xl">
              How SQLGenius Works
            </h2>
            <p className="mt-4 text-base text-text-secondaryLight dark:text-text-secondaryDark max-w-xl mx-auto">
              Going from raw datasets or connections to exported spreadsheets in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light dark:bg-primary-dark text-white text-xl font-bold shadow-md mb-6 relative">
                  {step.num}
                  {idx < 3 && (
                    <div className="hidden lg:block absolute left-14 top-7 w-[calc(100%+2rem)] border-t border-dashed border-border-light dark:border-border-dark z-0" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark mb-2 relative z-10">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark leading-relaxed relative z-10">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-surface-light dark:bg-surface-dark transition-colors duration-200">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark sm:text-4xl text-left">
                Empowering Everyone, from Students to Business Analysts
              </h2>
              <p className="mt-4 text-base text-text-secondaryLight dark:text-text-secondaryDark text-left leading-relaxed">
                SQLGenius bridges the gap between database design and visual execution, providing insights to technical and non-technical staff alike.
              </p>
              
              <div className="mt-8 space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2.5 bg-teal-50 dark:bg-teal-900/10 rounded-lg text-primary-light">
                    <GraduationCap size={22} />
                  </div>
                  <div className="ml-4 text-left">
                    <h4 className="text-base font-bold text-text-primaryLight dark:text-text-primaryDark">SQL Learning Support</h4>
                    <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1 leading-relaxed">
                      AI-generated explanations explain nested SELECTs, JOIN clauses, and aggregations in simple sentences, accelerating learning.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2.5 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-secondary-light">
                    <TrendingUp size={22} />
                  </div>
                  <div className="ml-4 text-left">
                    <h4 className="text-base font-bold text-text-primaryLight dark:text-text-primaryDark">Boost Analytics Speed</h4>
                    <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1 leading-relaxed">
                      Create draft queries, test schemas, and download clean order summaries in seconds without writing code blocks from scratch.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {testimonials.map((t, idx) => (
                <Card key={idx} className="p-8 text-left bg-bg-light dark:bg-bg-dark border-none shadow-md flex flex-col justify-between min-h-[220px]">
                  <p className="text-sm italic text-text-primaryLight dark:text-text-primaryDark leading-relaxed">
                    "{t.quote}"
                  </p>
                  <div className="mt-6 border-t border-border-light dark:border-border-dark pt-4">
                    <div className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark">{t.author}</div>
                    <div className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">{t.role}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-bg-light dark:bg-bg-dark transition-colors duration-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.06),transparent_40%)] pointer-events-none" />
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto rounded-card bg-gradient-to-br from-primary-light to-secondary-light text-white p-12 md:p-16 shadow-modal">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl leading-tight">
              Ready to Query Smarter?
            </h2>
            <p className="mt-4 text-base text-teal-50 max-w-xl mx-auto leading-relaxed">
              Start translating natural language sentences into clean, validated SQL today. No credit card required.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/register">
                <Button className="bg-white text-primary-light hover:bg-slate-50 border-none shadow-md h-14 px-8 rounded-button text-base font-bold transition-all">
                  Get Started For Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
export default Landing;
