

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL: string;
  readonly VITE_AUTH_SERVICE: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

