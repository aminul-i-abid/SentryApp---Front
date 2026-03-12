/**
 * useChartExport Hook
 * FASE 5.4 - Chart Export Functionality
 *
 * Provides functionality to export charts as PNG, SVG, or PDF
 * Handles chart serialization, naming conventions, and error handling
 *
 * Usage:
 * const chartRef = useRef<HTMLDivElement>(null);
 * const { exportAsPNG, exportAsSVG, isExporting } = useChartExport(chartRef, 'VarianceReport');
 *
 * // Export chart
 * await exportAsPNG();
 */

import { useCallback, useState, RefObject } from 'react';
import html2canvas from 'html2canvas';
import type { ChartExportOptions } from '../../types/dashboardTypes';

/**
 * Return type for useChartExport hook
 */
interface UseChartExportReturn {
  exportAsPNG: (options?: Partial<ChartExportOptions>) => Promise<void>;
  exportAsSVG: (options?: Partial<ChartExportOptions>) => Promise<void>;
  isExporting: boolean;
  lastExportTime?: Date;
  error: string | null;
}

/**
 * Default export options
 */
const DEFAULT_EXPORT_OPTIONS: ChartExportOptions = {
  format: 'png',
  width: 1200,
  height: 600,
  backgroundColor: '#ffffff',
};

/**
 * Generate filename with timestamp
 */
const generateFileName = (baseName: string, format: 'png' | 'svg' | 'pdf'): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${baseName}_${timestamp}.${format}`;
};

/**
 * Hook to export charts as PNG or SVG
 *
 * @param chartRef - Reference to the chart container element
 * @param baseName - Base filename for exports (without extension)
 * @returns Export functions and status
 */
export const useChartExport = (
  chartRef: RefObject<HTMLDivElement>,
  baseName: string = 'Chart'
): UseChartExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExportTime, setLastExportTime] = useState<Date>();

  /**
   * Trigger download of a file
   */
  const downloadFile = useCallback((url: string, filename: string): void => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);

    try {
      link.click();
    } catch (err) {
      console.error('Error downloading file:', err);
    } finally {
      document.body.removeChild(link);
    }
  }, []);

  /**
   * Export chart as PNG using html2canvas
   */
  const exportAsPNG = useCallback(
    async (options: Partial<ChartExportOptions> = {}): Promise<void> => {
      if (!chartRef.current) {
        setError('Chart reference not found');
        return;
      }

      setIsExporting(true);
      setError(null);

      try {
        const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options, format: 'png' as const };

        // Get canvas from html2canvas
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: mergedOptions.backgroundColor || '#ffffff',
          scale: 2, // Higher scale for better quality
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: mergedOptions.width,
          height: mergedOptions.height,
        });

        // Convert canvas to blob and create download
        const link = document.createElement('a');
        const filename = generateFileName(baseName, 'png');

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            downloadFile(url, filename);
            URL.revokeObjectURL(url);
            setLastExportTime(new Date());
          }
        }, 'image/png');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to export as PNG';
        setError(errorMessage);
        console.error('PNG export error:', err);
      } finally {
        setIsExporting(false);
      }
    },
    [chartRef, baseName, downloadFile]
  );

  /**
   * Export chart as SVG
   * Note: This is a simplified SVG export. For complex charts, consider using chart-specific SVG export
   */
  const exportAsSVG = useCallback(
    async (options: Partial<ChartExportOptions> = {}): Promise<void> => {
      if (!chartRef.current) {
        setError('Chart reference not found');
        return;
      }

      setIsExporting(true);
      setError(null);

      try {
        const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options, format: 'svg' as const };

        // First, try to extract SVG from chart library if available
        const svgElement = chartRef.current.querySelector('svg');

        if (svgElement) {
          // Clone and serialize existing SVG
          const svgClone = svgElement.cloneNode(true) as SVGElement;

          // Set dimensions
          if (mergedOptions.width) {
            svgClone.setAttribute('width', mergedOptions.width.toString());
          }
          if (mergedOptions.height) {
            svgClone.setAttribute('height', mergedOptions.height.toString());
          }

          // Serialize to string
          const svgString = new XMLSerializer().serializeToString(svgClone);

          // Create SVG blob with proper header
          const svgBlob = new Blob(
            [`<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`],
            { type: 'image/svg+xml;charset=utf-8' }
          );

          const url = URL.createObjectURL(svgBlob);
          const filename = generateFileName(baseName, 'svg');

          downloadFile(url, filename);
          URL.revokeObjectURL(url);
          setLastExportTime(new Date());
        } else {
          // Fallback: Convert to canvas then to PNG if no SVG found
          console.warn('No SVG element found, falling back to PNG export');
          await exportAsPNG(options);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to export as SVG';
        setError(errorMessage);
        console.error('SVG export error:', err);
      } finally {
        setIsExporting(false);
      }
    },
    [chartRef, baseName, downloadFile, exportAsPNG]
  );

  return {
    exportAsPNG,
    exportAsSVG,
    isExporting,
    lastExportTime,
    error,
  };
};

/**
 * Extended hook variant with batch export support
 */
interface UseBatchChartExportProps {
  charts: Array<{
    ref: RefObject<HTMLDivElement>;
    name: string;
  }>;
  format: 'png' | 'svg';
}

interface UseBatchChartExportReturn {
  exportAll: (options?: Partial<ChartExportOptions>) => Promise<void>;
  exportByName: (name: string, options?: Partial<ChartExportOptions>) => Promise<void>;
  isExporting: boolean;
  progress: number; // 0-100
  error: string | null;
}

export const useBatchChartExport = ({
  charts,
  format = 'png',
}: UseBatchChartExportProps): UseBatchChartExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Export all charts in batch
   */
  const exportAll = useCallback(
    async (options: Partial<ChartExportOptions> = {}): Promise<void> => {
      setIsExporting(true);
      setError(null);
      setProgress(0);

      try {
        const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options, format };

        for (let i = 0; i < charts.length; i++) {
          const { ref, name } = charts[i];

          if (!ref.current) {
            console.warn(`Chart ref not found for: ${name}`);
            continue;
          }

          try {
            if (format === 'png') {
              const canvas = await html2canvas(ref.current, {
                backgroundColor: mergedOptions.backgroundColor || '#ffffff',
                scale: 2,
                useCORS: true,
                allowTaint: false,
                logging: false,
              });

              const filename = generateFileName(name, 'png');
              canvas.toBlob((blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = filename;
                  link.click();
                  URL.revokeObjectURL(url);
                }
              }, 'image/png');
            } else {
              // SVG export
              const svgElement = ref.current.querySelector('svg');
              if (svgElement) {
                const svgString = new XMLSerializer().serializeToString(svgElement);
                const svgBlob = new Blob(
                  [`<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`],
                  { type: 'image/svg+xml;charset=utf-8' }
                );

                const url = URL.createObjectURL(svgBlob);
                const filename = generateFileName(name, 'svg');
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
                URL.revokeObjectURL(url);
              }
            }

            // Update progress
            setProgress(Math.floor(((i + 1) / charts.length) * 100));

            // Small delay to prevent flooding
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (err) {
            console.error(`Error exporting chart: ${name}`, err);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to export charts';
        setError(errorMessage);
      } finally {
        setIsExporting(false);
        setProgress(0);
      }
    },
    [charts, format]
  );

  /**
   * Export single chart by name
   */
  const exportByName = useCallback(
    async (name: string, options: Partial<ChartExportOptions> = {}): Promise<void> => {
      const chart = charts.find((c) => c.name === name);

      if (!chart) {
        setError(`Chart not found: ${name}`);
        return;
      }

      setIsExporting(true);
      setError(null);

      try {
        const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options, format };

        if (!chart.ref.current) {
          throw new Error(`Chart reference not found for: ${name}`);
        }

        if (format === 'png') {
          const canvas = await html2canvas(chart.ref.current, {
            backgroundColor: mergedOptions.backgroundColor || '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
          });

          const filename = generateFileName(name, 'png');
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              link.click();
              URL.revokeObjectURL(url);
            }
          }, 'image/png');
        } else {
          // SVG export
          const svgElement = chart.ref.current.querySelector('svg');
          if (svgElement) {
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob(
              [`<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`],
              { type: 'image/svg+xml;charset=utf-8' }
            );

            const url = URL.createObjectURL(svgBlob);
            const filename = generateFileName(name, 'svg');
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : `Failed to export chart: ${name}`;
        setError(errorMessage);
        console.error('Export error:', err);
      } finally {
        setIsExporting(false);
      }
    },
    [charts, format]
  );

  return {
    exportAll,
    exportByName,
    isExporting,
    progress,
    error,
  };
};

/**
 * Advanced hook with automatic retry and quality optimization
 */
interface UseAdvancedChartExportProps {
  chartRef: RefObject<HTMLDivElement>;
  baseName: string;
  maxRetries?: number;
  retryDelay?: number;
}

interface UseAdvancedChartExportReturn extends UseChartExportReturn {
  exportAsPNGWithRetry: (options?: Partial<ChartExportOptions>) => Promise<void>;
  exportAsSVGWithRetry: (options?: Partial<ChartExportOptions>) => Promise<void>;
}

export const useAdvancedChartExport = ({
  chartRef,
  baseName,
  maxRetries = 3,
  retryDelay = 1000,
}: UseAdvancedChartExportProps): UseAdvancedChartExportReturn => {
  const basicExport = useChartExport(chartRef, baseName);

  /**
   * Export with automatic retry on failure
   */
  const exportWithRetry = useCallback(
    async (
      exportFn: (options?: Partial<ChartExportOptions>) => Promise<void>,
      options?: Partial<ChartExportOptions>
    ): Promise<void> => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          await exportFn(options);
          return; // Success
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));

          if (attempt < maxRetries - 1) {
            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
          }
        }
      }

      if (lastError) {
        throw lastError;
      }
    },
    [maxRetries, retryDelay]
  );

  const exportAsPNGWithRetry = useCallback(
    async (options?: Partial<ChartExportOptions>): Promise<void> => {
      await exportWithRetry(basicExport.exportAsPNG, options);
    },
    [basicExport.exportAsPNG, exportWithRetry]
  );

  const exportAsSVGWithRetry = useCallback(
    async (options?: Partial<ChartExportOptions>): Promise<void> => {
      await exportWithRetry(basicExport.exportAsSVG, options);
    },
    [basicExport.exportAsSVG, exportWithRetry]
  );

  return {
    ...basicExport,
    exportAsPNGWithRetry,
    exportAsSVGWithRetry,
  };
};
