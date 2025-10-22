import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FiArrowLeft,
  FiFileText,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiUser,
} from "react-icons/fi";
import API_BASE_URL from "../../utils/apiConfig";
import { resolveImageUrl, FALLBACK_AVATAR } from "../../utils/imageUtils";

const formatDate = (value) => {
  if (!value) {
    return "Sin registro";
  }
  try {
    return new Date(value).toLocaleDateString();
  } catch (error) {
    return "Sin registro";
  }
};

const Documents = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [expedienteFile, setExpedienteFile] = useState(null);
  const [uploadingExpediente, setUploadingExpediente] = useState(false);

  const [documentForm, setDocumentForm] = useState({
    label: "",
    category: "general",
    file: null,
  });
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchEmployee = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`${API_BASE_URL}/api/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!isMounted) {
          return;
        }

        if (response.data.success && response.data.employee) {
          setEmployee(response.data.employee);
        } else {
          setEmployee(null);
          setError("No se encontró información del empleado solicitado.");
        }
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }
        const serverMessage =
          fetchError.response?.data?.error ??
          fetchError.response?.data?.message ??
          "No se pudo cargar la información del empleado.";
        setError(serverMessage);
        setEmployee(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEmployee();

    return () => {
      isMounted = false;
    };
  }, [id, reloadKey]);

  const expedienteUrl = useMemo(() => {
    if (!employee?.expedienteFile) {
      return null;
    }
    return resolveImageUrl(employee.expedienteFile);
  }, [employee]);

  const documents = useMemo(
    () =>
      (employee?.documents ?? []).filter(
        (doc) => doc.category?.toLowerCase() !== "expediente",
      ),
    [employee],
  );

  const handleGoBack = () => {
    navigate("/admin-dashboard/employees");
  };

  const handleExpedienteChange = (event) => {
    setExpedienteFile(event.target.files?.[0] ?? null);
  };

  const handleExpedienteUpload = async (event) => {
    event.preventDefault();
    if (!expedienteFile) {
      alert("Selecciona un archivo para el expediente.");
      return;
    }
    setUploadingExpediente(true);
    try {
      const formData = new FormData();
      formData.append("expediente", expedienteFile);
      await axios.post(
        `${API_BASE_URL}/api/employee/${id}/expediente`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setExpedienteFile(null);
      event.currentTarget.reset();
      setReloadKey((current) => current + 1);
    } catch (errorUpload) {
      const serverMessage =
        errorUpload.response?.data?.error ??
        errorUpload.response?.data?.message;
      alert(
        serverMessage ||
          "No se pudo cargar el expediente. Intenta nuevamente.",
      );
    } finally {
      setUploadingExpediente(false);
    }
  };

  const handleDocumentFormChange = (event) => {
    const { name, value, files } = event.target;
    if (name === "file") {
      setDocumentForm((previous) => ({
        ...previous,
        file: files?.[0] ?? null,
      }));
    } else {
      setDocumentForm((previous) => ({
        ...previous,
        [name]: value,
      }));
    }
  };

  const handleDocumentUpload = async (event) => {
    event.preventDefault();
    if (!employee) {
      return;
    }
    const trimmedLabel = documentForm.label.trim();
    if (!trimmedLabel) {
      alert("Ingresa un nombre para el documento.");
      return;
    }
    if (!documentForm.file) {
      alert("Selecciona un archivo para subir.");
      return;
    }

    setUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append("label", trimmedLabel);
      formData.append("category", documentForm.category);
      formData.append("document", documentForm.file);

      const response = await axios.post(
        `${API_BASE_URL}/api/employee/${id}/documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.data.success && response.data.document) {
        setEmployee((previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            documents: [...(previous.documents ?? []), response.data.document],
            updatedAt: new Date(),
          };
        });
        setDocumentForm({ label: "", category: "general", file: null });
        event.currentTarget.reset();
      }
    } catch (docError) {
      const serverMessage =
        docError.response?.data?.error ?? docError.response?.data?.message;
      alert(serverMessage || "No se pudo cargar el documento.");
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDocumentDelete = async (documentId) => {
    if (!employee || deletingDocumentId) {
      return;
    }
    setDeletingDocumentId(documentId);
    try {
      await axios.delete(
        `${API_BASE_URL}/api/employee/${id}/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setEmployee((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          documents: (previous.documents ?? []).filter(
            (doc) => doc._id !== documentId,
          ),
          updatedAt: new Date(),
        };
      });
    } catch (deleteError) {
      const serverMessage =
        deleteError.response?.data?.error ??
        deleteError.response?.data?.message;
      alert(serverMessage || "No se pudo eliminar el documento.");
    } finally {
      setDeletingDocumentId("");
    }
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
          >
            <FiArrowLeft size={16} />
            Regresar
          </button>

          {employee && (
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:border-teal-500/40 dark:text-teal-200">
              <FiUser size={14} />
              Expediente de {employee?.userId?.name ?? "Empleado"}
            </span>
          )}
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-300">
              Cargando información del empleado...
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
              <p className="max-w-xs text-sm font-medium text-rose-600 dark:text-rose-200">
                {error}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-inner dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex flex-wrap items-center gap-5">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg ring-4 ring-teal-100/80 dark:border-slate-900 dark:ring-teal-500/20">
                    <img
                      src={
                        resolveImageUrl(employee?.userId?.profileImage) ??
                        FALLBACK_AVATAR
                      }
                      alt={employee?.userId?.name ?? "Perfil de empleado"}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_AVATAR;
                      }}
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {employee?.userId?.name ?? "Sin nombre"}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {employee?.department?.dep_name ?? "Sin departamento"} ·{" "}
                      {employee?.designation ?? "Sin puesto asignado"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      Última actualización: {formatDate(employee?.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Documentación
                    </p>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Gestiona el expediente y documentos adicionales
                    </h2>
                    <p className="mt-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">
                      Actualiza el expediente general y adjunta contratos, identificaciones u otros archivos relevantes desde un solo lugar.
                    </p>
                  </div>
                  {expedienteUrl && (
                    <a
                      href={expedienteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200"
                    >
                      <FiFileText size={16} />
                      Ver expediente
                    </a>
                  )}
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <form
                    onSubmit={handleExpedienteUpload}
                    className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-200">
                        <FiUploadCloud size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          Actualizar expediente general
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Reemplaza el expediente principal (PDF recomendado).
                        </p>
                      </div>
                    </div>
                    <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Archivo
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={handleExpedienteChange}
                        className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      />
                    </label>
                    {expedienteFile && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Seleccionado: {expedienteFile.name}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={uploadingExpediente}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow-md transition hover:from-teal-400 hover:to-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FiUploadCloud size={14} />
                      {uploadingExpediente ? "Subiendo..." : "Subir expediente"}
                    </button>
                  </form>

                  <form
                    onSubmit={handleDocumentUpload}
                    className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/60 text-slate-600 dark:bg-slate-800/60 dark:text-slate-200">
                        <FiPlus size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          Agregar documento adicional
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Adjunta contratos, identificaciones u otros archivos.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Nombre del documento
                        <input
                          type="text"
                          name="label"
                          value={documentForm.label}
                          onChange={handleDocumentFormChange}
                          placeholder="Ejemplo: Contrato laboral"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Categoría
                        <select
                          name="category"
                          value={documentForm.category}
                          onChange={handleDocumentFormChange}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          <option value="general">General</option>
                          <option value="contrato">Contrato</option>
                          <option value="identificacion">Identificación</option>
                          <option value="fiscal">Fiscal</option>
                          <option value="certificacion">Certificación</option>
                          <option value="otros">Otros</option>
                        </select>
                      </label>
                    </div>
                    <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Archivo
                      <input
                        type="file"
                        name="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={handleDocumentFormChange}
                        className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      />
                    </label>
                    {documentForm.file && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Seleccionado: {documentForm.file.name}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={uploadingDocument}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-widest text-slate-600 shadow-sm transition hover:border-teal-300 hover:text-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-300 dark:hover:text-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FiPlus size={14} />
                      {uploadingDocument ? "Guardando..." : "Subir documento"}
                    </button>
                  </form>
                </div>

                <div className="mt-8">
                  {documents.length === 0 && !expedienteUrl ? (
                    <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                      No hay documentos asociados a este empleado.
                    </div>
                  ) : (
                    <ul className="grid gap-4 md:grid-cols-2">
                      {expedienteUrl && (
                        <li className="flex items-center justify-between rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm text-teal-700 shadow-sm dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-teal-500 shadow-sm dark:bg-slate-900 dark:text-teal-200">
                              <FiFileText size={16} />
                            </span>
                            <div>
                              <p className="font-semibold">
                                Expediente general
                              </p>
                              <p className="text-xs uppercase tracking-wide text-teal-500/80 dark:text-teal-200/80">
                                {employee?.expedienteOriginalName ?? "Documento"}
                              </p>
                            </div>
                          </div>
                          <a
                            href={expedienteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold uppercase tracking-widest text-teal-600 transition hover:text-teal-500 dark:text-teal-200"
                          >
                            Abrir
                          </a>
                        </li>
                      )}

                      {documents.map((doc) => {
                        const documentUrl =
                          resolveImageUrl(doc.fileUrl) ?? doc.fileUrl;
                        return (
                          <li
                            key={doc.publicId}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                          >
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                                <FiFileText size={16} />
                              </span>
                              <div>
                                <p className="font-semibold">{doc.label}</p>
                                <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                  {formatDate(doc.uploadedAt)} · {doc.category}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold uppercase tracking-widest text-teal-600 transition hover:text-teal-500 dark:text-teal-200"
                              >
                                Abrir
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDocumentDelete(doc._id)}
                                disabled={deletingDocumentId === doc._id}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 text-rose-500 transition hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-rose-500/40 dark:text-rose-200 dark:hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Documents;
