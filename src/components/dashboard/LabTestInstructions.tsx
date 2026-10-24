import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FileText, ExternalLink, AlertCircle, Download, X, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { CartProductSkeleton } from "./CartProductSkeleton";
import { getLabPdfFile, getUserCartProductsV2 } from "../../services/api";
import { storage } from "../../utils/storage";
import {
  getLabTestCode,
  isLabTestProduct,
  type CartProduct,
} from "../../types/products";
import { toPdfFileUrl } from "../../utils/media";

export function LabTestInstructions() {
  const [labProduct, setLabProduct] = useState<CartProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  // Add these new state variables
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [labReportUploaded, setLabReportUploaded] = useState(false);

  // Add this line
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLabProducts = async () => {
      try {
        const userData = storage.getUserData();
        if (!userData?.email) {
          throw new Error("User data not found");
        }

        // Set patient name
        setPatientName(`${userData.firstName} ${userData.lastName}`);

        const response = await getUserCartProductsV2(userData.email);

        if (response.status === 1 && Array.isArray(response.product)) {
          const labTestProduct = response.product.find(isLabTestProduct);

          if (labTestProduct?.order_id) {
            setLabProduct(labTestProduct);

            try {
              const pdfResponse = await getLabPdfFile(labTestProduct.order_id);
              setLabReportUploaded(Number(pdfResponse.already_uploaded) === 1);
            } catch (pdfErr) {
              console.error("Failed to check lab PDF status:", pdfErr);
              setLabReportUploaded(false);
            }
          } else {
            setLabProduct(null);
            setLabReportUploaded(false);
          }
        } else {
          setLabProduct(null);
          setLabReportUploaded(false);
        }
      } catch (err) {
        console.error("Failed to fetch lab products:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabProducts();
  }, []);

  const handleFindLabCorp = () => {
    window.open(
      "https://www.labcorp.com/patients/labs-and-appointments",
      "_blank"
    );
  };

  // Add this function after handleFindLabCorp
  const handleDownloadLabRequisition = async () => {
    if (!labProduct) return;

    setIsPdfLoading(true);
    try {
      const res = await getLabPdfFile(labProduct.order_id);
      if (res.status === 1 && res.pdf_file) {
        setPdfUrl(toPdfFileUrl(res.pdf_file));
        setIsPdfModalOpen(true);
      } else {
        alert(res.message || "Failed to retrieve PDF");
      }
    } catch (err) {
      console.error("Error fetching PDF:", err);
      const message =
        err && typeof err === "object" && "message" in err && err.message
          ? String(err.message)
          : "Error loading PDF. Please try again.";
      alert(message);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
    setPdfUrl(null);
  };

  // Add this new function
  const handleOrderClick = () => {
    if (labProduct?.order_id) {
      navigate(`/orders/${labProduct.order_id}`);
    }
  };

  // Add useEffect for body scroll lock
  useEffect(() => {
    if (isPdfModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isPdfModalOpen]);

  if (isLoading) {
    return <CartProductSkeleton />;
  }

  if (error || !labProduct) {
    return null; // Hide the section if there's no lab test product
  }

  if (labReportUploaded) {
    return (
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h2
              className="text-xl font-bold text-gray-900 mb-1 cursor-pointer hover:text-green-600 transition-colors"
              onClick={handleOrderClick}
            >
              Order #{labProduct.order_id}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {labProduct.product_category_name}
            </p>
            <div className="bg-green-50 rounded-xl p-6">
              <p className="text-gray-700">
                Your lab results have been received and are being reviewed.
                You'll be notified when you're ready to schedule your doctor
                appointment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const testCode = getLabTestCode(labProduct);

  // L501 Instructions
  if (testCode === "L501") {
    return (
      <>
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2
                className="text-xl font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={handleOrderClick}
              >
                Order #{labProduct.order_id}
              </h2>
              <p className="text-gray-600 text-sm">
                {labProduct.product_category_name}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-4">
            <p className="text-gray-900 mb-4">
              Hello <span className="font-semibold">{patientName}</span>,
            </p>
            <p className="text-gray-700 mb-4">
              Thank you for choosing Affordable Wellness for your testing needs.
            </p>
            <p className="text-gray-700 mb-4">
              Attached is your LabCorp requisition form. Please follow these
              steps:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 mb-3">
                    Print the attached requisition and bring it with you on the
                    day of your blood draw.
                  </p>
                  <Button
                    onClick={handleDownloadLabRequisition}
                    disabled={isPdfLoading}
                    className=" hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {isPdfLoading ? "Loading..." : "Download Lab Requisition"}
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 mb-3">
                    Visit any LabCorp Patient Service Center at your
                    convenience. You can find the nearest location and book an
                    appointment here:
                  </p>
                  <Button
                    onClick={handleFindLabCorp}
                    className=" hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    Find a LabCorp location
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  3
                </div>
                <p className="text-gray-700">
                  At check-in, under financial responsibility, please select the
                  option:{" "}
                  <span className="font-semibold">
                    "I have already paid or someone else is responsible."
                  </span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  4
                </div>
                <p className="text-gray-700">
                  Please ensure you carry a valid photo ID along with your
                  printed requisition.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p>
                If you have any questions or need assistance, please contact our
                support team.
              </p>
            </div>
          </div>
        </div>

        {/* PDF Modal */}
        {isPdfModalOpen &&
          createPortal(
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                  onClick={handleClosePdfModal}
                />

                {/* Modal */}
                <div className="relative w-full max-w-6xl transform rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Lab Requisition Form
                    </h3>
                    <button
                      onClick={handleClosePdfModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  {pdfUrl && (
                    <div className="w-full h-[70vh] sm:h-[80vh]">
                      <iframe
                        src={pdfUrl || undefined}
                        className="w-full h-full border-0 rounded-lg"
                        title="Lab Requisition PDF"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}
      </>
    );
  }

  // 501 Instructions
  if (testCode === "501") {
    return (
      <>
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2
                className="text-xl font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={handleOrderClick}
              >
                Order #{labProduct.order_id}
              </h2>
              <p className="text-gray-600 text-sm">
                {labProduct.product_category_name}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-4">
            <p className="text-gray-900 mb-4">
              Hello <span className="font-semibold">{patientName}</span>,
            </p>
            <p className="text-gray-700 mb-4">
              Thank you for choosing Affordable Wellness for your testing needs.
            </p>
            <p className="text-gray-700 mb-4">
              We have shipped your blood draw kit to the address on file. Once
              you receive it, please follow these steps:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  1
                </div>
                <p className="text-gray-700">
                  We will contact you to schedule your blood draw.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  2
                </div>
                <p className="text-gray-700">
                  You may choose the site most convenient for you.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  3
                </div>
                <p className="text-gray-700">
                  Bring the kit and requisition form (included inside the kit)
                  with you to the draw site.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  4
                </div>
                <p className="text-gray-700">
                  The phlebotomist at the draw site will use the kit for your
                  sample collection.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  !
                </div>
                <p className="text-gray-700">
                  <span className="font-semibold">Important:</span> You do not
                  need to perform or handle any part of the bloodwork yourself.
                  The phlebotomist and laboratory staff will take care of the
                  entire process.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                  5
                </div>
                <p className="text-gray-700">
                  The completed kit will be shipped back to our laboratory for
                  processing (shipping instructions and prepaid return label are
                  included).
                </p>
              </div>
            </div>
          </div>

          {/* Download Button Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">
                  Download Your Lab Requisition
                </h4>
                <p className="text-blue-700 text-sm">
                  Get your requisition form for the blood draw appointment
                </p>
              </div>
              <Button
                onClick={handleDownloadLabRequisition}
                disabled={isPdfLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isPdfLoading ? "Loading..." : "Download Lab Requisition"}
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p>
                If you have any questions or need assistance, please contact our
                support team.
              </p>
            </div>
          </div>
        </div>

        {/* PDF Modal */}
        {isPdfModalOpen &&
          createPortal(
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                  onClick={handleClosePdfModal}
                />

                {/* Modal */}
                <div className="relative w-full max-w-6xl transform rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Lab Requisition Form
                    </h3>
                    <button
                      onClick={handleClosePdfModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  {pdfUrl && (
                    <div className="w-full h-[70vh] sm:h-[80vh]">
                      <iframe
                        src={pdfUrl || undefined}
                        className="w-full h-full border-0 rounded-lg"
                        title="Lab Requisition PDF"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}
      </>
    );
  }

  return null; // Don't show anything if test_code doesn't match
}
