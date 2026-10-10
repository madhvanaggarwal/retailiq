import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Database,
  ShieldCheck,
  Cpu,
  Layers,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Sliders,
  ExternalLink
} from 'lucide-react';

export const MethodologyModule: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMethodology().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Loading methodology audit...</span>
        </div>
      </div>
    );
  }

  const { dataset_audit, models_architecture, limitations_and_disclaimers } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-2 bg-teal-50 text-brand-700 rounded-xl border border-teal-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900">
              Methodology, Data Quality Audit & Model Architectures
            </h3>
            <p className="text-xs text-slate-500">
              Complete technical transparency: training splits, feature engineering pipelines, hyperparameters, and known caveats.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Dataset Audit Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Dataset Audit & Cleanliness (Jan 2013 – Jul 2015)</span>
          </h4>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
            100% Validated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Total Store Records</span>
            <span className="text-base font-bold text-navy-900">{dataset_audit.historical_records.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Total Unique Stores</span>
            <span className="text-base font-bold text-navy-900">{dataset_audit.stores_count} Stores</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Open Days Evaluated</span>
            <span className="text-base font-bold text-brand-700">{dataset_audit.open_days_sales_greater_zero.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Duplicate Records</span>
            <span className="text-base font-bold text-emerald-700">{dataset_audit.duplicate_records} (Clean)</span>
          </div>
        </div>

        {/* Missing Values Resolution Table */}
        <div>
          <h5 className="text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wider">
            Missing Value Imputation Strategy:
          </h5>
          <div className="divide-y divide-slate-100 text-xs border border-slate-200 rounded-xl overflow-hidden">
            {dataset_audit.missing_values_handled.map((m: any, idx: number) => (
              <div key={idx} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <strong className="text-navy-900">{m.field}</strong>
                  <span className="text-slate-400 ml-2">({m.missing_count} missing entries)</span>
                </div>
                <div className="text-slate-600 text-[11px] sm:max-w-md">
                  {m.resolution}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Known Anomalies */}
        <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200 text-xs space-y-1">
          <strong className="text-amber-900 block font-semibold">Documented Data Anomalies:</strong>
          <ul className="text-slate-600 space-y-1 list-disc list-inside text-[11px]">
            {dataset_audit.known_data_anomalies.map((an: string, idx: number) => (
              <li key={idx}>{an}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. Model Architectures & Feature Engineering */}
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
          Trained Machine Learning Model Specifications
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models_architecture.slice(0, 2).map((m: any) => (
            <div
              key={m.model_id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h5 className="text-sm font-bold text-navy-900">{m.name}</h5>
                  <span className="text-[11px] font-semibold text-brand-700">{m.algorithm}</span>
                </div>
                <Cpu className="w-5 h-5 text-brand-700" />
              </div>

              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Target Variable</span>
                <span className="font-mono text-slate-800 text-[11px]">{m.target_variable}</span>
              </div>

              {/* Evaluation Metrics */}
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1.5">
                  Held-Out Evaluation Metrics
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(m.evaluation_metrics).map(([k, v]) => (
                    <div key={k} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 uppercase block">{k}</span>
                      <span className="font-bold text-navy-900 block mt-0.5">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hyperparameters */}
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">
                  Hyperparameters (Config)
                </span>
                <div className="p-2.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] space-y-0.5">
                  {Object.entries(m.hyperparameters).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-brand-300">{k}:</span> {String(v)}
                    </div>
                  ))}
                </div>
              </div>

              {m.key_shap_drivers && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">
                    Top SHAP Feature Importance Drivers
                  </span>
                  <ul className="text-slate-600 space-y-0.5 list-disc list-inside text-[11px]">
                    {m.key_shap_drivers.map((drv: string, idx: number) => (
                      <li key={idx}>{drv}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Limitations and Honest Disclaimers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Known Limitations & Scope Boundaries</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {limitations_and_disclaimers.map((l: any, idx: number) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <strong className="text-navy-900 block">{l.topic}</strong>
              <p className="text-slate-600 leading-relaxed text-[11px]">{l.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
