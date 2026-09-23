"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { getDialogDescription, generateDialogIds, validateDialogAccessibility, getDialogConfig } from '../../utils/fixDialogAccessibility';
import { cn } from './utils';

/**
 * UPGRADED Accessible Dialog
 * Added safety fallbacks for size configurations to prevent 'undefined' crashes.
 */
export function AccessibleDialog({
  open,
  onOpenChange,
  title,
  description,
  descriptionType,
  children,
  className,
  size = 'MEDIUM', // Existing default
  hideDescription = false,
  ...props
}) {
  const ids = React.useMemo(() => generateDialogIds('accessible-dialog'), []);

  const finalDescription = React.useMemo(() => {
    if (description) return description;
    if (descriptionType) return getDialogDescription(descriptionType);
    return getDialogDescription('DEFAULT');
  }, [description, descriptionType]);

  // --- UPGRADE: SAFE CONFIG FETCHING ---
  const config = React.useMemo(() => {
    // Attempt to get config for the requested size
    const fetchedConfig = getDialogConfig(size);
    
    // Fallback: If 'size' (like LARGE) isn't in your utils, 
    // try 'MEDIUM', then finally an empty object to prevent crashing.
    if (fetchedConfig && fetchedConfig.className) return fetchedConfig;
    
    const fallback = getDialogConfig('MEDIUM');
    return fallback || { className: 'sm:max-w-md' }; 
  }, [size]);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const validation = validateDialogAccessibility({
        title,
        description: finalDescription,
        children,
      });
      if (!validation.isValid) console.error('Dialog accessibility errors:', validation.errors);
    }
  }, [title, finalDescription, children]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent
        // config.className is now guaranteed to exist
        className={cn(config.className, className, "max-h-[95vh] overflow-y-auto")}
        aria-labelledby={ids.titleId}
        aria-describedby={hideDescription ? undefined : ids.descriptionId}
      >
        <DialogHeader>
          <DialogTitle id={ids.titleId} className="text-xl font-bold text-slate-900">
            {title}
          </DialogTitle>
          {!hideDescription && (
            <DialogDescription id={ids.descriptionId} className="sr-only">
              {finalDescription}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {/* Added a wrapper div to handle spacing consistently */}
        <div id={ids.contentId} className="py-2">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AccessibleDialog;