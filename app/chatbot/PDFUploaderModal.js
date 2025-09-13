"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
} from "lucide-react";

export default function PDFUploaderModal({ isOpen, onClose }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== files.length) {
      alert("Only PDF files are allowed!");
    }

    setSelectedFiles(pdfFiles);
    setResults(null);
    setError(null);
  };

  const removeFile = (index) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      setUploadProgress(30);

      const response = await fetch("/api/pdf-processor", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setUploadProgress(100);
      setResults(data);
      setSelectedFiles([]); // Clear selected files

      // Reset file input
      const fileInput = document.getElementById("pdf-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleDownload = (downloadUrl, filename) => {
    if (!downloadUrl) {
      return;
    }

    const fullUrl = `http://127.0.0.1:9000${downloadUrl}`;
    console.log("Downloading from:", fullUrl);

    const link = document.createElement("a");
    link.href = fullUrl;
    link.download = filename || "report.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleClose = () => {
    // Reset state when closing
    setSelectedFiles([]);
    setResults(null);
    setError(null);
    setUploading(false);
    setUploadProgress(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Upload className="h-5 w-5 text-emerald-400" />
            <span>Upload Medical Reports</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Upload PDF files for AI analysis and structured data extraction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center">
            <input
              id="pdf-input"
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="pdf-input"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="h-12 w-12 text-zinc-500" />
              <p className="text-lg font-medium text-zinc-300">
                Click to upload PDF files
              </p>
              <p className="text-sm text-zinc-500">
                Support for multiple PDFs up to 50MB each
              </p>
            </label>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-zinc-300">
                Selected Files ({selectedFiles.length})
              </h3>
              <ScrollArea className="h-32 border border-zinc-700 rounded-lg p-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-zinc-800 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-medium text-zinc-300">
                        {file.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs bg-zinc-800 border-zinc-700 text-zinc-300"
                      >
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">
                  Processing files...
                </span>
                <span className="text-sm text-zinc-400">{uploadProgress}%</span>
              </div>
              <Progress
                value={uploadProgress}
                className="w-full bg-zinc-800"
                indicatorColor="bg-emerald-600"
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 text-red-400 bg-zinc-800 p-3 rounded-lg">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={uploadFiles}
            disabled={selectedFiles.length === 0 || uploading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing {selectedFiles.length} files...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Process {selectedFiles.length} PDFs
              </>
            )}
          </Button>

          {/* Results Section */}
          {results && (
            <Card className="bg-zinc-800 border-zinc-700 mt-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span>Processing Complete</span>
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Successfully processed {results.total_files_processed} PDF
                  files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-700 p-4 rounded-lg border border-emerald-600/30">
                    <div className="text-2xl font-bold text-emerald-400">
                      {results.total_files_processed || 0}
                    </div>
                    <div className="text-sm text-zinc-400">Files Processed</div>
                  </div>
                  <div className="bg-zinc-700 p-4 rounded-lg border border-emerald-600/30">
                    <div className="text-2xl font-bold text-emerald-400">
                      {results.total_reports_merged || 0}
                    </div>
                    <div className="text-sm text-zinc-400">Reports Merged</div>
                  </div>
                  <div className="bg-zinc-700 p-4 rounded-lg border border-emerald-600/30">
                    <div className="text-2xl font-bold text-emerald-400">
                      {results.unique_tests_found || 0}
                    </div>
                    <div className="text-sm text-zinc-400">
                      Unique Tests Found
                    </div>
                  </div>
                </div>

                {/* Download Links */}
                {results.pdf_download_urls &&
                  results.pdf_download_urls.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-zinc-300">
                        Download Processed Reports
                      </h3>
                      <div className="space-y-2">
                        {results.pdf_download_urls.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border border-zinc-700 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-emerald-400" />
                              <span className="text-sm font-medium text-zinc-300">
                                {item.filename}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-emerald-600 text-emerald-400 hover:bg-zinc-700 hover:text-emerald-300"
                              onClick={() =>
                                handleDownload(item.download_url, item.filename)
                              }
                              disabled={!item.download_url}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              {!item.download_url ? "N/A" : "Download"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Parsed Data Preview */}
                {results.parsed_json && results.parsed_json.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-zinc-300">
                      Extracted Data Preview
                    </h3>
                    <ScrollArea className="h-48 border border-zinc-700 rounded-lg p-4">
                      {results.parsed_json.map((report, index) => (
                        <div
                          key={index}
                          className="mb-4 p-3 bg-zinc-700 rounded-lg"
                        >
                          <div className="grid grid-cols-2 gap-2 text-sm text-zinc-300">
                            <div>
                              <strong>Patient:</strong>{" "}
                              {report.patient_info?.name || "N/A"}
                            </div>
                            <div>
                              <strong>Age:</strong>{" "}
                              {report.patient_info?.age || "N/A"}
                            </div>
                            <div>
                              <strong>Report Type:</strong>{" "}
                              {report.report_type || "N/A"}
                            </div>
                            <div>
                              <strong>Tests:</strong>{" "}
                              {report.test_results?.length || 0} tests
                            </div>
                          </div>
                          {report.summary && (
                            <div className="mt-2">
                              <strong className="text-zinc-300">
                                Summary:
                              </strong>
                              <p className="text-xs text-zinc-400 mt-1">
                                {report.summary}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
