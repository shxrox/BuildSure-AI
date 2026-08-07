import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getDigitalPlan } from "../../services/project.service";
import { calculateMaterials } from "../../utils/volumetricEngine";
import { calculateSriLankanCost } from "../../utils/pricingEngine";

function CostPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [costData, setCostData] = useState<any>(null);
  const [actualSpent, setActualSpent] = useState<number>(0);
  const [isEditingSpent, setIsEditingSpent] = useState(false);
  const [tempSpent, setTempSpent] = useState("");

  useEffect(() => {
    const fetchCosts = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const plan = await getDigitalPlan(id);
        if (plan) {
          const boq = calculateMaterials(
            plan.walls || [],
            plan.doors || [],
            plan.windows || [],
            plan.rooms || []
          );
          const financial = calculateSriLankanCost(
            boq.materials,
            boq.metrics.totalFloorAreaSqm
          );
          setCostData(financial);
        }
      } catch (error) {
        console.error("Failed to load financial estimation", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCosts();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Computing Sri Lankan Construction Costing...
      </div>
    );
  }

  if (!costData) {
    return (
      <div className="p-6 text-gray-600">
        Please complete your digital floor plan in the Blueprint workspace to generate cost metrics.
      </div>
    );
  }

  const { breakdown } = costData;
  const grandTotal = breakdown.grandTotalCost;
  const remainingBudget = grandTotal - actualSpent;

  const handleSaveSpent = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempSpent);
    if (!isNaN(val)) {
      setActualSpent(val);
    }
    setIsEditingSpent(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">💰 Sri Lankan Construction Costing & Tracking</h1>
        <p className="text-gray-600">
          Live market evaluation based on current Sri Lankan material rates, labor allowances, and actual spend tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Estimated Construction Cost</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            Rs. {grandTotal.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-500">Actual Spent Recorded</p>
            <button
              onClick={() => { setTempSpent(actualSpent.toString()); setIsEditingSpent(true); }}
              className="text-xs text-blue-500 hover:underline font-semibold cursor-pointer"
            >
              Edit Spend
            </button>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            Rs. {actualSpent.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Estimated Variance / Remaining</p>
          <p className={`text-2xl font-bold mt-1 ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Rs. {remainingBudget.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {isEditingSpent && (
        <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <form onSubmit={handleSaveSpent} className="flex gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Enter Total Actual Spending (LKR)</label>
              <input
                type="number"
                value={tempSpent}
                onChange={(e) => setTempSpent(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 7950000"
                autoFocus
              />
            </div>
            <button type="submit" className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold cursor-pointer">
              Save Amount
            </button>
            <button type="button" onClick={() => setIsEditingSpent(false)} className="mt-5 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-semibold cursor-pointer">
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Cost Breakdown Structure</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expense Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estimated Cost (LKR)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Bricks & Blocks Subtotal</td>
              <td className="px-6 py-4">Rs. {breakdown.brickCost.toLocaleString("en-LK")}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Cement Subtotal</td>
              <td className="px-6 py-4">Rs. {breakdown.cementCost.toLocaleString("en-LK")}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Sand Subtotal</td>
              <td className="px-6 py-4">Rs. {breakdown.sandCost.toLocaleString("en-LK")}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Flooring & Tiling Subtotal</td>
              <td className="px-6 py-4">Rs. {breakdown.tileCost.toLocaleString("en-LK")}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Doors & Windows Allowances</td>
              <td className="px-6 py-4">Rs. {breakdown.openingsCost.toLocaleString("en-LK")}</td>
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td className="px-6 py-4 text-gray-900">Total Material Cost</td>
              <td className="px-6 py-4 text-blue-600">Rs. {breakdown.totalMaterialCost.toLocaleString("en-LK")}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Estimated Labor & Finishing</td>
              <td className="px-6 py-4">Rs. {breakdown.estimatedLaborCost.toLocaleString("en-LK")}</td>
            </tr>
            <tr className="bg-blue-50 font-bold text-base">
              <td className="px-6 py-4 text-gray-900">Grand Total Estimated Construction Cost</td>
              <td className="px-6 py-4 text-blue-700">Rs. {breakdown.grandTotalCost.toLocaleString("en-LK", { maximumFractionDigits: 0 })}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CostPage;