import React from 'react';

export const CommissionCard = () => {
  const flatCommissionTiers = [
    { size: '< 100', enrolled: '5+', payout: '$100' },
    { size: '100 – 500', enrolled: '10+', payout: '$200' },
    { size: '500 – 1,000', enrolled: '25+', payout: '$500' },
    { size: '1,000 – 4,999', enrolled: '50+', payout: '$1,000' },
    { size: '5,000 – 10,000', enrolled: '125+', payout: '$2,500' },
    { size: '10,000+', enrolled: '250+', payout: '$5,000' },
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💰</span>
        <span className="text-xs font-medium text-gray-500 uppercase">Commission Structure</span>
      </div>

      {/* Flat Commission Table */}
      <div className="mb-4">
        <h5 className="text-xs font-semibold text-gray-700 mb-2">Flat Commission (One-Time)</h5>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-2 py-1.5 font-medium text-gray-600">Employer Size</th>
                <th className="text-left px-2 py-1.5 font-medium text-gray-600">Enrollment Req.</th>
                <th className="text-right px-2 py-1.5 font-medium text-gray-600">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flatCommissionTiers.map((tier, index) => (
                <tr key={index} className="bg-white">
                  <td className="px-2 py-1.5 text-gray-700">{tier.size}</td>
                  <td className="px-2 py-1.5 text-gray-700">{tier.enrolled} enrolled</td>
                  <td className="px-2 py-1.5 text-right font-medium text-green-600">{tier.payout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recurring Commission */}
      <div>
        <h5 className="text-xs font-semibold text-gray-700 mb-2">Recurring Commission</h5>
        <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">First 3 years</span>
            <span className="text-xs font-medium text-green-600">10% of gross profits</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">After 3 years</span>
            <span className="text-xs font-medium text-green-600">5% of gross profits</span>
          </div>
          <div className="border-t border-gray-100 pt-2 mt-2">
            <p className="text-xs text-gray-500">Paid quarterly in USD. Continues for as long as you remain in CoinFlip Gradual.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
