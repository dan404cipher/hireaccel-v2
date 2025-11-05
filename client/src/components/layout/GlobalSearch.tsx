import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Briefcase, Users, Building2, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { apiClient } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/contexts/AuthContext";

interface SearchResults {
  jobs: any[];
  candidates: any[];
  companies: any[];
  users: any[];
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    jobs: [],
    candidates: [],
    companies: [],
    users: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const debouncedQuery = useDebounce(query, 300);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    // Only search if dialog is open and query is valid
    if (!open || debouncedQuery.length < 2) {
      if (debouncedQuery.length < 2) {
        setResults({ jobs: [], candidates: [], companies: [], users: [] });
      }
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const performSearch = async () => {
      setLoading(true);
      console.log('[GlobalSearch] Starting search for:', debouncedQuery);
      console.log('[GlobalSearch] User role:', user?.role);
      
      try {
        // Determine which types to search based on user role
        const searchTypes: ('jobs' | 'candidates' | 'companies' | 'users')[] = ['jobs', 'companies'];
        
        // Include users search - candidates are included in users
        if (user?.role === 'admin' || user?.role === 'superadmin') {
          searchTypes.push('users');
        }

        console.log('[GlobalSearch] Search types:', searchTypes);
        console.log('[GlobalSearch] Making API call...');

        const response = await apiClient.globalSearch({
          q: debouncedQuery,
          limit: 5,
          types: searchTypes,
        });

        console.log('[GlobalSearch] API response:', response);
        console.log('[GlobalSearch] Response data:', response.data);

        // Only update results if this request hasn't been cancelled
        if (!isCancelled && response.success && response.data) {
          console.log('[GlobalSearch] Setting results:', {
            jobs: response.data.jobs?.length || 0,
            candidates: response.data.candidates?.length || 0,
            companies: response.data.companies?.length || 0,
            users: response.data.users?.length || 0,
          });
          setResults(response.data);
        } else {
          console.warn('[GlobalSearch] Response not successful or no data:', {
            success: response.success,
            hasData: !!response.data,
          });
        }
      } catch (error: any) {
        console.error("[GlobalSearch] Search error:", error);
        console.error("[GlobalSearch] Error details:", {
          message: error?.message,
          status: error?.status,
          detail: error?.detail,
        });
        if (!isCancelled) {
          setResults({ jobs: [], candidates: [], companies: [], users: [] });
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(performSearch, 100);
    
    return () => {
      isCancelled = true;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [debouncedQuery, user?.role, open]);

  const handleSelect = (type: string, item: any) => {
    setOpen(false);
    setQuery("");

    switch (type) {
      case "job":
        navigate(`/dashboard/jobs/${item._id || item.id}`);
        break;
      case "company":
        // Use companyId if available, otherwise fall back to _id or id
        const companyId = item.companyId || item._id || item.id;
        if (companyId) {
          navigate(`/dashboard/companies/${companyId}`);
        }
        break;
      case "user":
        if (user?.role === 'admin' || user?.role === 'superadmin') {
          // If it's a candidate, navigate to candidates page using customId
          if (item.role === 'candidate') {
            const candidateId = item.customId || item._id || item.id;
            navigate(`/dashboard/candidates/${candidateId}`);
          } else if (item.role === 'hr') {
            // For HR users, navigate to HR profile page using customId
            const hrId = item.customId || item._id || item.id;
            navigate(`/dashboard/hr-profile/${hrId}`);
          } else {
            // For other users, navigate to users page
            navigate(`/dashboard/users/${item._id || item.id}`);
          }
        }
        break;
    }
  };

  const totalResults =
    results.jobs.length +
    results.candidates.length +
    results.companies.length +
    results.users.length;

  return (
    <>
      <div
        className="relative w-96 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <div className="pl-10 pr-4 py-3 bg-background border border-input rounded-md text-sm text-muted-foreground flex items-center justify-between hover:border-accent-foreground/20 transition-colors">
          <span>Search jobs, candidates, companies...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          // Clear search when dialog closes
          setQuery("");
          setResults({ jobs: [], candidates: [], companies: [], users: [] });
        }
      }}>
        <CommandInput
          placeholder="Search jobs, candidates, companies, users..."
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            // Clear results immediately when query changes
            if (value.length < 2) {
              setResults({ jobs: [], candidates: [], companies: [], users: [] });
            }
          }}
        />
        <CommandList>
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-3" />
              <span className="text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          )}


          {!loading && debouncedQuery.length >= 2 && totalResults === 0 && (
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2">
                <Search className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs text-muted-foreground">Try a different search term</p>
              </div>
            </CommandEmpty>
          )}

          {!loading && debouncedQuery.length >= 2 && results.jobs.length > 0 && (
            <CommandGroup heading="Jobs">
              {results.jobs.map((job) => (
                <CommandItem
                  key={job._id || job.id}
                  value={`job-${job._id || job.id}`}
                  onSelect={() => handleSelect("job", job)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3 flex-shrink-0">
                    <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium text-sm truncate">{job.title}</span>
                    <span className="text-xs text-muted-foreground truncate mt-0.5">
                      {job.companyId?.name || job.company} • {job.location}
                      {job.salaryRange && (
                        <> • {job.salaryRange.currency} {job.salaryRange.min}-{job.salaryRange.max}</>
                      )}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}


          {!loading &&
            debouncedQuery.length >= 2 &&
            results.companies.length > 0 && (
              <CommandGroup heading="Companies">
                {results.companies.map((company) => (
                  <CommandItem
                    key={company._id || company.id}
                    value={`company-${company._id || company.id}`}
                    onSelect={() => handleSelect("company", company)}
                    className="cursor-pointer"
                  >
                    <Avatar className="mr-3 h-9 w-9 flex-shrink-0">
                      <AvatarImage 
                        src={company.logoUrl} 
                        alt={company.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-blue-600 text-white">
                        <Building2 className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium text-sm truncate">
                        {company.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate mt-0.5">
                        {company.industry || "No industry"}
                        {company.location && ` • ${company.location}`}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

          {!loading &&
            debouncedQuery.length >= 2 &&
            results.users.length > 0 &&
            (user?.role === 'admin' || user?.role === 'superadmin') && (
              <CommandGroup heading="Users">
                {results.users.map((userItem) => (
                  <CommandItem
                    key={userItem._id || userItem.id}
                    value={`user-${userItem._id || userItem.id}`}
                    onSelect={() => handleSelect("user", userItem)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 mr-3 flex-shrink-0">
                      <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium text-sm truncate">
                        {userItem.firstName} {userItem.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate mt-0.5">
                        {userItem.email} • {userItem.role}
                        {userItem.role === 'candidate' && userItem.customId && ` • ${userItem.customId}`}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

