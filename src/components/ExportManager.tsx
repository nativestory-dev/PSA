import React, { useState } from 'react';
import { 
  DocumentArrowDownIcon, 
  TableCellsIcon,
  DocumentTextIcon,
  DocumentIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { SearchResult, ExportRequest } from '../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

interface ExportManagerProps {
  searchResults?: SearchResult[];
  onExportComplete?: (request: ExportRequest) => void;
}

const ExportManager: React.FC<ExportManagerProps> = ({ 
  searchResults = [], 
  onExportComplete 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [exportOptions, setExportOptions] = useState({
    includeContactInfo: true,
    includeExperience: true,
    includeEducation: true,
    includeSkills: true,
    includeSocialProfiles: true,
    includeBio: false,
  });

  const exportToCSV = (data: SearchResult[]) => {
    const csvData = data.map(result => {
      const person = result.person;
      return {
        'First Name': person.firstName,
        'Last Name': person.lastName,
        'Email': person.email || '',
        'Phone': person.phone || '',
        'Company': person.company || '',
        'Position': person.position || '',
        'Location': person.location || '',
        'LinkedIn URL': person.linkedinUrl || '',
        'Bio': exportOptions.includeBio ? person.bio || '' : '',
        'Skills': exportOptions.includeSkills ? person.skills?.join(', ') || '' : '',
        'Experience': exportOptions.includeExperience ? 
          person.experience?.map(exp => `${exp.position} at ${exp.company}`).join('; ') || '' : '',
        'Education': exportOptions.includeEducation ? 
          person.education?.map(edu => `${edu.degree} in ${edu.field} from ${edu.institution}`).join('; ') || '' : '',
        'Social Profiles': exportOptions.includeSocialProfiles ? 
          person.socialProfiles?.map(profile => `${profile.platform}: ${profile.url}`).join('; ') || '' : '',
        'Relevance Score': result.relevanceScore,
        'Matched Fields': result.matchedFields.join(', '),
      };
    });

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `people-search-results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToExcel = (data: SearchResult[]) => {
    const excelData = data.map(result => {
      const person = result.person;
      return {
        'First Name': person.firstName,
        'Last Name': person.lastName,
        'Email': person.email || '',
        'Phone': person.phone || '',
        'Company': person.company || '',
        'Position': person.position || '',
        'Location': person.location || '',
        'LinkedIn URL': person.linkedinUrl || '',
        'Bio': exportOptions.includeBio ? person.bio || '' : '',
        'Skills': exportOptions.includeSkills ? person.skills?.join(', ') || '' : '',
        'Experience': exportOptions.includeExperience ? 
          person.experience?.map(exp => `${exp.position} at ${exp.company}`).join('; ') || '' : '',
        'Education': exportOptions.includeEducation ? 
          person.education?.map(edu => `${edu.degree} in ${edu.field} from ${edu.institution}`).join('; ') || '' : '',
        'Social Profiles': exportOptions.includeSocialProfiles ? 
          person.socialProfiles?.map(profile => `${profile.platform}: ${profile.url}`).join('; ') || '' : '',
        'Relevance Score': result.relevanceScore,
        'Matched Fields': result.matchedFields.join(', '),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'People Search Results');
    
    XLSX.writeFile(workbook, `people-search-results-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = async (data: SearchResult[]) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add title
    pdf.setFontSize(20);
    pdf.text('People Search Results', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Add export info
    pdf.setFontSize(12);
    pdf.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Total Results: ${data.length}`, 20, yPosition);
    yPosition += 20;

    // Add each person's information
    data.forEach((result, index) => {
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }

      const person = result.person;
      
      // Person header
      pdf.setFontSize(16);
      pdf.text(`${person.firstName} ${person.lastName}`, 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`${person.position} at ${person.company}`, 20, yPosition);
      yPosition += 8;
      
      if (person.location) {
        pdf.text(`Location: ${person.location}`, 20, yPosition);
        yPosition += 6;
      }
      
      if (exportOptions.includeContactInfo) {
        if (person.email) {
          pdf.text(`Email: ${person.email}`, 20, yPosition);
          yPosition += 6;
        }
        if (person.phone) {
          pdf.text(`Phone: ${person.phone}`, 20, yPosition);
          yPosition += 6;
        }
        if (person.linkedinUrl) {
          pdf.text(`LinkedIn: ${person.linkedinUrl}`, 20, yPosition);
          yPosition += 6;
        }
      }
      
      if (exportOptions.includeBio && person.bio) {
        pdf.text(`Bio: ${person.bio}`, 20, yPosition);
        yPosition += 6;
      }
      
      if (exportOptions.includeSkills && person.skills && person.skills.length > 0) {
        pdf.text(`Skills: ${person.skills.join(', ')}`, 20, yPosition);
        yPosition += 6;
      }
      
      if (exportOptions.includeExperience && person.experience && person.experience.length > 0) {
        pdf.text('Experience:', 20, yPosition);
        yPosition += 6;
        person.experience.forEach(exp => {
          pdf.text(`  • ${exp.position} at ${exp.company}`, 20, yPosition);
          yPosition += 6;
        });
      }
      
      if (exportOptions.includeEducation && person.education && person.education.length > 0) {
        pdf.text('Education:', 20, yPosition);
        yPosition += 6;
        person.education.forEach(edu => {
          pdf.text(`  • ${edu.degree} in ${edu.field} from ${edu.institution}`, 20, yPosition);
          yPosition += 6;
        });
      }
      
      pdf.text(`Relevance Score: ${result.relevanceScore}%`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Matched Fields: ${result.matchedFields.join(', ')}`, 20, yPosition);
      yPosition += 15;
    });

    pdf.save(`people-search-results-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExport = async () => {
    if (searchResults.length === 0) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);
    
    try {
      const exportRequest: ExportRequest = {
        id: Date.now().toString(),
        searchId: 'current-search',
        format: exportFormat,
        status: 'processing',
        createdAt: new Date(),
      };

      switch (exportFormat) {
        case 'csv':
          exportToCSV(searchResults);
          break;
        case 'excel':
          exportToExcel(searchResults);
          break;
        case 'pdf':
          await exportToPDF(searchResults);
          break;
      }

      exportRequest.status = 'completed';
      exportRequest.completedAt = new Date();
      
      toast.success(`Successfully exported ${searchResults.length} results as ${exportFormat.toUpperCase()}`);
      onExportComplete?.(exportRequest);
      
    } catch (error) {
      toast.error('Export failed. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    {
      id: 'csv' as const,
      name: 'CSV',
      description: 'Comma-separated values, compatible with Excel and Google Sheets',
      icon: TableCellsIcon,
      color: 'text-green-600',
    },
    {
      id: 'excel' as const,
      name: 'Excel',
      description: 'Microsoft Excel format with formatting and multiple sheets',
      icon: DocumentIcon,
      color: 'text-blue-600',
    },
    {
      id: 'pdf' as const,
      name: 'PDF',
      description: 'Portable Document Format, perfect for sharing and printing',
      icon: DocumentTextIcon,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-linkedin p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
          <p className="text-sm text-gray-600">
            Export {searchResults.length} search results in your preferred format
          </p>
        </div>
        <DocumentArrowDownIcon className="h-8 w-8 text-linkedin-blue" />
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Choose Export Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formatOptions.map((format) => {
            const Icon = format.icon;
            return (
              <button
                key={format.id}
                onClick={() => setExportFormat(format.id)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  exportFormat === format.id
                    ? 'border-linkedin-blue bg-linkedin-lightBlue'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <Icon className={`h-5 w-5 mr-2 ${format.color}`} />
                  <span className="font-medium text-gray-900">{format.name}</span>
                </div>
                <p className="text-sm text-gray-600">{format.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Options */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Include in Export</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(exportOptions).map(([key, value]) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  [key]: e.target.checked
                }))}
                className="h-4 w-4 text-linkedin-blue focus:ring-linkedin-blue border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Export Preview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Export Preview</h3>
        <div className="text-sm text-gray-600">
          <p>• {searchResults.length} contacts will be exported</p>
          <p>• Format: {exportFormat.toUpperCase()}</p>
          <p>• Estimated file size: {Math.round(searchResults.length * 0.5)}KB</p>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {isExporting ? (
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </div>
          ) : (
            <div className="flex items-center">
              <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
              Ready to export
            </div>
          )}
        </div>
        
        <button
          onClick={handleExport}
          disabled={isExporting || searchResults.length === 0}
          className="bg-linkedin-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-linkedin-darkBlue disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export {exportFormat.toUpperCase()}
            </>
          )}
        </button>
      </div>

      {/* Export History */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Exports</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <DocumentArrowDownIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">people-search-results-2024-01-15.csv</span>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <DocumentArrowDownIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">people-search-results-2024-01-14.pdf</span>
            </div>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportManager;
