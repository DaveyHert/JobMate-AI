import React, { useState, useMemo } from "react";
import {
  Search,
  ExternalLink,
  Filter,
  Globe,
  MapPin,
  Briefcase,
  Tag,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import jobBoardsData from "../data/job_boards_dataset.json";

interface JobBoard {
  name: string;
  url: string;
  region: string;
  industry_sector: string;
  platform_type: string;
  listing_types: string;
  description: string;
}

const JobBoards: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedPlatformType, setSelectedPlatformType] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Get unique values for filters
  const regions = useMemo(() => {
    const uniqueRegions = [
      ...new Set(jobBoardsData.map((board) => board.region)),
    ];
    return ["All", ...uniqueRegions.sort()];
  }, []);

  const industries = useMemo(() => {
    const uniqueIndustries = [
      ...new Set(jobBoardsData.map((board) => board.industry_sector)),
    ];
    return ["All", ...uniqueIndustries.sort()];
  }, []);

  const platformTypes = useMemo(() => {
    const uniqueTypes = [
      ...new Set(jobBoardsData.map((board) => board.platform_type)),
    ];
    return ["All", ...uniqueTypes.sort()];
  }, []);

  // Filter job boards
  const filteredJobBoards = useMemo(() => {
    return jobBoardsData.filter((board: JobBoard) => {
      const matchesSearch =
        board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        board.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        board.industry_sector.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegion =
        selectedRegion === "All" || board.region === selectedRegion;
      const matchesIndustry =
        selectedIndustry === "All" ||
        board.industry_sector === selectedIndustry;
      const matchesPlatformType =
        selectedPlatformType === "All" ||
        board.platform_type === selectedPlatformType;

      return (
        matchesSearch && matchesRegion && matchesIndustry && matchesPlatformType
      );
    });
  }, [searchTerm, selectedRegion, selectedIndustry, selectedPlatformType]);

  // Pagination
  const totalPages = Math.ceil(filteredJobBoards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobBoards = filteredJobBoards.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRegion, selectedIndustry, selectedPlatformType]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRegion("All");
    setSelectedIndustry("All");
    setSelectedPlatformType("All");
    setCurrentPage(1);
  };

  const getJobBoardIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("linkedin")) return "💼";
    if (nameLower.includes("indeed")) return "🔍";
    if (nameLower.includes("glassdoor")) return "🏢";
    if (nameLower.includes("remote")) return "🌐";
    if (nameLower.includes("startup") || nameLower.includes("angel"))
      return "🚀";
    if (
      nameLower.includes("freelance") ||
      nameLower.includes("upwork") ||
      nameLower.includes("fiverr")
    )
      return "💻";
    if (nameLower.includes("design") || nameLower.includes("dribbble"))
      return "🎨";
    if (nameLower.includes("tech") || nameLower.includes("dice")) return "⚡";
    if (nameLower.includes("crypto") || nameLower.includes("web3")) return "₿";
    if (nameLower.includes("government") || nameLower.includes("usa"))
      return "🏛️";
    if (nameLower.includes("health") || nameLower.includes("nurse"))
      return "🏥";
    if (nameLower.includes("academic") || nameLower.includes("education"))
      return "🎓";
    return "🌟";
  };

  const getPlatformTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "General Job Board":
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      "Tech Job Board":
        "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
      "Remote-Only Board":
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      "Startup Job Board":
        "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
      "Freelance Marketplace":
        "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      "Niche Job Board":
        "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800",
      "Government Board":
        "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
      "Academic Job Board":
        "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
    };
    return (
      colors[type] ||
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
    );
  };

  const renderGridView = () => (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {currentJobBoards.map((board: JobBoard, index: number) => (
        <div
          key={index}
          className='bg-white dark:bg-[#1F2937] rounded-lg border border-gray-200 dark:border-[#374151] p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600'
        >
          {/* Header */}
          <div className='flex items-start justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className='text-2xl'>{getJobBoardIcon(board.name)}</div>
              <div>
                <h3 className='font-semibold text-gray-900 dark:text-[#F3F4F6] text-lg'>
                  {board.name}
                </h3>
                <div className='flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  <MapPin className='w-3 h-3' />
                  {board.region}
                </div>
              </div>
            </div>
            <a
              href={board.url}
              target='_blank'
              rel='noopener noreferrer'
              className='p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
              title='Visit job board'
            >
              <ExternalLink className='w-5 h-5' />
            </a>
          </div>

          {/* Platform Type Badge */}
          <div className='mb-3'>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPlatformTypeColor(
                board.platform_type
              )}`}
            >
              <Tag className='w-3 h-3' />
              {board.platform_type}
            </span>
          </div>

          {/* Description */}
          <p className='text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3'>
            {board.description}
          </p>

          {/* Industry & Listing Types */}
          <div className='space-y-2 mb-4'>
            <div className='flex items-center gap-2 text-sm'>
              <Briefcase className='w-4 h-4 text-gray-400' />
              <span className='text-gray-600 dark:text-gray-400'>
                <span className='font-medium'>Industry:</span>{" "}
                {board.industry_sector}
              </span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <Globe className='w-4 h-4 text-gray-400' />
              <span className='text-gray-600 dark:text-gray-400'>
                <span className='font-medium'>Types:</span>{" "}
                {board.listing_types}
              </span>
            </div>
          </div>

          {/* Visit Button */}
          <a
            href={board.url}
            target='_blank'
            rel='noopener noreferrer'
            className='w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium'
          >
            Visit {board.name}
            <ExternalLink className='w-4 h-4' />
          </a>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className='space-y-4'>
      {currentJobBoards.map((board: JobBoard, index: number) => (
        <div
          key={index}
          className='bg-white dark:bg-[#1F2937] rounded-lg border border-gray-200 dark:border-[#374151] p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4 flex-1'>
              <div className='text-2xl'>{getJobBoardIcon(board.name)}</div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-3 mb-2'>
                  <h3 className='font-semibold text-gray-900 dark:text-[#F3F4F6] text-lg'>
                    {board.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPlatformTypeColor(
                      board.platform_type
                    )}`}
                  >
                    <Tag className='w-3 h-3' />
                    {board.platform_type}
                  </span>
                </div>

                <p className='text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2'>
                  {board.description}
                </p>

                <div className='flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400'>
                  <div className='flex items-center gap-1'>
                    <MapPin className='w-4 h-4' />
                    {board.region}
                  </div>
                  <div className='flex items-center gap-1'>
                    <Briefcase className='w-4 h-4' />
                    {board.industry_sector}
                  </div>
                  <div className='flex items-center gap-1'>
                    <Globe className='w-4 h-4' />
                    {board.listing_types}
                  </div>
                </div>
              </div>
            </div>

            <a
              href={board.url}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium ml-4'
            >
              Visit
              <ExternalLink className='w-4 h-4' />
            </a>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className='flex items-center justify-between mt-8'>
        <div className='text-sm text-gray-600 dark:text-gray-400'>
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, filteredJobBoards.length)} of{" "}
          {filteredJobBoards.length} job boards
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className='p-2 rounded-lg border border-gray-300 dark:border-[#374151] bg-white dark:bg-[#1F2937] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <ChevronLeft className='w-4 h-4' />
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && setCurrentPage(page)}
              disabled={page === "..."}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : page === "..."
                  ? "text-gray-400 cursor-default"
                  : "border border-gray-300 dark:border-[#374151] bg-white dark:bg-[#1F2937] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#374151]"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className='p-2 rounded-lg border border-gray-300 dark:border-[#374151] bg-white dark:bg-[#1F2937] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-[#F7F7FD] dark:bg-[#111827]'>
      {/* Header */}
      <div className='bg-white dark:bg-[#1F2937] border-b border-gray-200 dark:border-[#374151] px-6 py-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-2xl font-semibold text-gray-900 dark:text-[#F3F4F6]'>
                Job Boards Directory
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-1'>
                Discover the best job boards to find your next opportunity
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                {filteredJobBoards.length} of {jobBoardsData.length} job boards
              </div>

              {/* View Toggle */}
              <div className='flex items-center bg-gray-100 dark:bg-[#374151] rounded-lg p-1'>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-[#1F2937] text-gray-900 dark:text-[#F3F4F6] shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                  title='Grid view'
                >
                  <Grid3X3 className='w-4 h-4' />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white dark:bg-[#1F2937] text-gray-900 dark:text-[#F3F4F6] shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                  title='List view'
                >
                  <List className='w-4 h-4' />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className='space-y-4'>
            {/* Search Bar */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search job boards by name, industry, or description...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-[#374151] rounded-lg bg-white dark:bg-[#1F2937] text-gray-900 dark:text-[#F3F4F6] focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            {/* Filter Controls */}
            <div className='flex flex-wrap gap-4 items-center'>
              <div className='flex items-center gap-2'>
                <Filter className='w-4 h-4 text-gray-500' />
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Filters:
                </span>
              </div>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className='px-3 py-2 border border-gray-300 dark:border-[#374151] rounded-lg bg-white dark:bg-[#1F2937] text-gray-900 dark:text-[#F3F4F6] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>

              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className='px-3 py-2 border border-gray-300 dark:border-[#374151] rounded-lg bg-white dark:bg-[#1F2937] text-gray-900 dark:text-[#F3F4F6] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>

              <select
                value={selectedPlatformType}
                onChange={(e) => setSelectedPlatformType(e.target.value)}
                className='px-3 py-2 border border-gray-300 dark:border-[#374151] rounded-lg bg-white dark:bg-[#1F2937] text-gray-900 dark:text-[#F3F4F6] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                {platformTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {(searchTerm ||
                selectedRegion !== "All" ||
                selectedIndustry !== "All" ||
                selectedPlatformType !== "All") && (
                <button
                  onClick={clearFilters}
                  className='px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline'
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Boards Content */}
      <div className='max-w-7xl mx-auto px-6 py-6'>
        {filteredJobBoards.length === 0 ? (
          <div className='text-center py-12'>
            <div className='text-6xl mb-4'>🔍</div>
            <h3 className='text-lg font-medium text-gray-900 dark:text-[#F3F4F6] mb-2'>
              No job boards found
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              Try adjusting your search terms or filters to find more results.
            </p>
            <button
              onClick={clearFilters}
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium'
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? renderGridView() : renderListView()}
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default JobBoards;
