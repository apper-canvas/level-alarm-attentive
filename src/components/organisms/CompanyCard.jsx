import { useNavigate } from "react-router-dom";
import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Contacts from "@/components/pages/Contacts";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

export default function CompanyCard({ company, onEdit, onDelete, className }) {
  const navigate = useNavigate();

  function handleCardClick() {
    navigate(`/companies/${company.Id}`);
  }

  function handleEdit(e) {
    e.stopPropagation();
    onEdit(company);
  }

  function handleDelete(e) {
    e.stopPropagation();
    onDelete(company);
  }

  function getInitials(name) {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function formatRevenue(revenue) {
    if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(1)}M`;
    }
    if (revenue >= 1000) {
      return `$${(revenue / 1000).toFixed(0)}K`;
    }
    return `$${revenue}`;
  }
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary-200 group",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Company Logo/Initial */}
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {getInitials(company.companyName)}
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
            {company.companyName}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{company.industry}</span>
            <span>•</span>
            <span>{company.companySize}</span>
          </div>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 mt-1 block"
              onClick={(e) => e.stopPropagation()}
            >
              {company.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            icon="Edit2"
            className="h-8 w-8 p-0"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            icon="Trash2"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        {company.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ApperIcon name="Phone" size={14} />
            <span>{company.phone}</span>
          </div>
        )}
        {company.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ApperIcon name="Mail" size={14} />
            <span className="truncate">{company.email}</span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{company.contactCount}</div>
          <div className="text-xs text-gray-500">Contacts</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {company.dealCount}
          </div>
          <div className="text-xs text-gray-500">
            Deals ({formatRevenue(company.totalDealValue)})
          </div>
        </div>
      </div>

      {/* Revenue */}
      {company.annualRevenue > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">Annual Revenue</div>
          <div className="text-lg font-semibold text-green-600">
            {formatRevenue(company.annualRevenue)}
          </div>
        </div>
      )}

      {/* Tags */}
      {company.tags && company.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {company.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {company.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{company.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
            {getInitials(company.assignedTo)}
          </div>
          <span className="text-sm text-gray-600">
            {company.assignedTo}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCardClick}
          icon="Eye"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          View Details
        </Button>
      </div>
    </div>
);