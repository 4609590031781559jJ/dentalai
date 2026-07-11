"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function analyze() {
    if (!file) {
      alert("Önce panoramik röntgen yükle.");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        error: "Analiz sırasında hata oluştu.",
        details: String(err)
      });
    } finally {
      setLoading(false);
    }
  }

  const output = result?.outputs?.[0] ?? result?.[0] ?? result;

  const clinicalJson =
    output?.clinical_json?.value ??
    output?.clinical_json ??
    null;

  const findingCount =
    output?.finding_count?.value ??
    output?.finding_count ??
    clinicalJson?.finding_count ??
    "-";

  const clinicalStatus =
    output?.clinical_status?.value ??
    output?.clinical_status ??
    clinicalJson?.status ??
    "-";

  const treatmentPlan =
    output?.treatment_plan_draft?.value ??
    output?.treatment_plan_draft ??
    clinicalJson?.treatment_plan_draft ??
    [];

  const doctorNotice =
    output?.doctor_review_notice?.value ??
    output?.doctor_review_notice ??
    clinicalJson?.medical_disclaimer ??
    "AI çıktıları karar destek amaçlıdır. Tanı, tedavi ve reçete hekim onayı gerektirir.";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="rounded-3xl border border-cyan-400/20 bg-slate-900 p-8 shadow-2xl">
          <p className="mb-3 text-sm font-semibold text-cyan-300">
            Dental AI Clinical SaaS
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Panoramik Röntgen İçin AI Destekli Klinik İnceleme
          </h1>

          <p className="mt-5 max-w-3xl text-slate-300">
            Röntgeni yükle, AI bulguları işaretlesin, hekim onayı için klinik
            JSON, tedavi maliyeti taslağı ve güvenli reçete uyarıları üretsin.
          </p>

          <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-100">
            Bu sistem tanı, tedavi veya reçete yerine geçmez. Tüm çıktılar
            yalnızca karar destek amaçlıdır ve yetkili diş hekimi onayı gerektirir.
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Röntgen Yükle</h2>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selected = e.target.files?.[0] ?? null;
                setFile(selected);
                setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
              }}
              className="block w-full rounded-xl border border-white/10 bg-slate-800 p-3 text-sm text-slate-200"
            />

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Yüklenen röntgen"
                className="mt-5 max-h-[420px] w-full rounded-2xl object-contain border border-white/10 bg-black"
              />
            )}

            <button
              onClick={analyze}
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analiz ediliyor..." : "Dental AI Analiz Et"}
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Klinik Özet</h2>

            {!result && (
              <p className="text-slate-400">
                Analiz sonucu burada görünecek.
              </p>
            )}

            {result && (
              <div className="space-y-4">
                {result.error && (
                  <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-100">
                    {result.error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-800 p-4">
                    <p className="text-sm text-slate-400">Bulgu Sayısı</p>
                    <p className="text-3xl font-bold">{String(findingCount)}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-800 p-4">
                    <p className="text-sm text-slate-400">Klinik Durum</p>
                    <p className="text-xl font-bold">{String(clinicalStatus)}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-100">
                  {doctorNotice}
                </div>

                {Array.isArray(treatmentPlan) && treatmentPlan.length > 0 && (
                  <div className="rounded-2xl bg-slate-800 p-4">
                    <h3 className="mb-3 font-semibold">Tedavi Maliyet Taslağı</h3>

                    <div className="space-y-2">
                      {treatmentPlan.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="rounded-xl border border-white/10 p-3 text-sm"
                        >
                          <p className="font-semibold">{item.procedure}</p>
                          <p className="text-slate-400">
                            {item.tdb_code} · {item.line_total_try} TRY
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Ham API Yanıtı</h2>
            <pre className="max-h-[520px] overflow-auto rounded-2xl bg-black p-4 text-xs text-green-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </main>
  );
}

