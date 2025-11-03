import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckIcon, 
  XMarkIcon,
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { SubscriptionPlan } from '../types';
import toast from 'react-hot-toast';

const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'free',
      price: 0,
      currency: 'USD',
      features: [
        'Basic search functionality',
        'Up to 10 searches per month',
        'Basic filters',
        'Export up to 5 contacts',
        'Email support',
      ],
      maxSearches: 10,
      maxExports: 5,
    },
    {
      id: 'basic',
      name: 'basic',
      price: 19.99,
      currency: 'USD',
      features: [
        'Advanced search filters',
        'Up to 100 searches per month',
        'Advanced filters and parameters',
        'Export up to 50 contacts',
        'Priority email support',
        'Search history',
      ],
      maxSearches: 100,
      maxExports: 50,
    },
    {
      id: 'premium',
      name: 'premium',
      price: 49.99,
      currency: 'USD',
      features: [
        'All Basic features',
        'Unlimited searches',
        'Advanced analytics',
        'Unlimited exports',
        'Priority phone support',
        'API access',
        'Custom integrations',
        'Team collaboration',
      ],
      maxSearches: -1,
      maxExports: -1,
    },
    {
      id: 'enterprise',
      name: 'enterprise',
      price: 199.99,
      currency: 'USD',
      features: [
        'All Premium features',
        'Dedicated account manager',
        'Custom data sources',
        'White-label solution',
        'Advanced security features',
        'SLA guarantee',
        'Custom training',
        '24/7 phone support',
      ],
      maxSearches: -1,
      maxExports: -1,
    },
  ];

  const handleUpgrade = async (planId: string) => {
    setIsProcessing(true);
    setSelectedPlan(planId);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Successfully upgraded to ${planId} plan!`);
    } catch (error) {
      toast.error('Failed to upgrade plan. Please try again.');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free':
        return <UserGroupIcon className="h-8 w-8 text-gray-500" />;
      case 'basic':
        return <ChartBarIcon className="h-8 w-8 text-blue-500" />;
      case 'premium':
        return <StarIcon className="h-8 w-8 text-yellow-500" />;
      case 'enterprise':
        return <ShieldCheckIcon className="h-8 w-8 text-purple-500" />;
      default:
        return <UserGroupIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'free':
        return 'border-gray-200';
      case 'basic':
        return 'border-blue-200';
      case 'premium':
        return 'border-yellow-200';
      case 'enterprise':
        return 'border-purple-200';
      default:
        return 'border-gray-200';
    }
  };

  const isCurrentPlan = (planName: string) => {
    return user?.subscriptionPlan.name === planName;
  };

  const isPopularPlan = (planName: string) => {
    return planName === 'premium';
  };

  return (
    <div className="min-h-screen bg-linkedin-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your people search needs. All plans include our core search functionality.
          </p>
        </div>

        {/* Current Plan Banner */}
        {user?.subscriptionPlan && (
          <div className="bg-linkedin-blue text-white rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Current Plan: {user.subscriptionPlan.name.charAt(0).toUpperCase() + user.subscriptionPlan.name.slice(1)}</h2>
                <p className="text-linkedin-lightBlue">
                  ${user.subscriptionPlan.price}/month • 
                  {user.subscriptionPlan.maxSearches === -1 ? ' Unlimited' : ` ${user.subscriptionPlan.maxSearches}`} searches • 
                  {user.subscriptionPlan.maxExports === -1 ? ' Unlimited' : ` ${user.subscriptionPlan.maxExports}`} exports
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-linkedin-lightBlue">Next billing date</div>
                <div className="font-semibold">January 15, 2024</div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-linkedin border-2 ${getPlanColor(plan.name)} ${
                isPopularPlan(plan.name) ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
              }`}
            >
              {/* Popular Badge */}
              {isPopularPlan(plan.name) && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.name)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 capitalize">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="text-center">
                  {isCurrentPlan(plan.name) ? (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                      Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isProcessing && selectedPlan === plan.id}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        isPopularPlan(plan.name)
                          ? 'bg-yellow-500 text-yellow-900 hover:bg-yellow-600'
                          : 'bg-linkedin-blue text-white hover:bg-linkedin-darkBlue'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isProcessing && selectedPlan === plan.id ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        `Upgrade to ${plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}`
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 bg-white rounded-lg shadow-linkedin overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Feature Comparison</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Features</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="px-6 py-3 text-center text-sm font-medium text-gray-500 capitalize">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Monthly Searches</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-600">
                      {plan.maxSearches === -1 ? 'Unlimited' : plan.maxSearches}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Monthly Exports</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-600">
                      {plan.maxExports === -1 ? 'Unlimited' : plan.maxExports}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Advanced Filters</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.name === 'free' ? (
                        <XMarkIcon className="h-5 w-5 text-red-500 mx-auto" />
                      ) : (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">API Access</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.name === 'enterprise' || plan.name === 'premium' ? (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Priority Support</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.name === 'free' ? (
                        <XMarkIcon className="h-5 w-5 text-red-500 mx-auto" />
                      ) : (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-linkedin p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I change my plan anytime?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-linkedin p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What happens to my data if I cancel?</h3>
              <p className="text-gray-600">
                Your search history and exported data will be available for 30 days after cancellation. You can download your data during this period.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-linkedin p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Do you offer refunds?</h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-linkedin p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is there a free trial?</h3>
              <p className="text-gray-600">
                Yes! All paid plans come with a 14-day free trial. No credit card required to start your trial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
