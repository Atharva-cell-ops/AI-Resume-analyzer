import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Award, Plus, Trash2 } from 'lucide-react';

export const CertificationsForm: React.FC = () => {
  const { resumeData, addCertification, updateCertification, removeCertification } = useResume();
  const { certifications } = resumeData;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" /> Certifications
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Industry certificates from AWS, Google Cloud, Microsoft, or specialized institutes.
          </p>
        </div>
        <button
          type="button"
          onClick={addCertification}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Add Certificate
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50">
          <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No certifications added yet.</p>
          <button
            type="button"
            onClick={addCertification}
            className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
          >
            + Add Certification
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="p-5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-900">
                  {cert.name || 'New Certification'}
                </span>
                <button
                  type="button"
                  onClick={() => removeCertification(cert.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                  title="Delete Certification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Certification Name <span className="text-indigo-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                    placeholder="e.g. AWS Certified Solutions Architect – Associate"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issuing Organization <span className="text-indigo-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                    placeholder="e.g. Amazon Web Services / Google Cloud"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issue Date / Year
                  </label>
                  <input
                    type="text"
                    value={cert.issueDate}
                    onChange={(e) => updateCertification(cert.id, { issueDate: e.target.value })}
                    placeholder="e.g. 2023"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Credential ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={cert.credentialId || ''}
                    onChange={(e) => updateCertification(cert.id, { credentialId: e.target.value })}
                    placeholder="e.g. AWS-ASA-82019"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verification URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={cert.url || ''}
                    onChange={(e) => updateCertification(cert.id, { url: e.target.value })}
                    placeholder="https://credly.com/your-badge"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

