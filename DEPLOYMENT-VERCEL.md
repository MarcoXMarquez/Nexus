# Desplegar Nexus MCU 1.0 en Vercel

Esta guía está pensada para realizar el despliegue personalmente. El repositorio no contiene claves privadas y Codex no publica ningún recurso remoto.

## 1. Requisitos gratuitos

- Una cuenta personal de GitHub.
- Una cuenta Hobby de Vercel.
- Una cuenta Free de Supabase.
- Git y Node.js 22 o 24 instalados.

Vercel Hobby debe utilizarse para un proyecto personal y no comercial. El dominio `tu-proyecto.vercel.app` es gratuito. Un dominio personalizado es opcional y se compra por separado.

## 2. Probar Nexus localmente

1. Duplica `.env.example` y llámalo `.env.local`.
2. Deja temporalmente `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
3. Ejecuta:

```bash
npm install
npm run dev
```

4. Abre `http://localhost:3000`.

Sin las variables de Supabase, Nexus debe abrir en modo invitado. Esto permite verificar la interfaz antes de crear la nube.

## 3. Crear el proyecto Supabase

1. Entra en [Supabase](https://supabase.com/dashboard).
2. Selecciona **New project**.
3. Elige el plan Free y una región cercana a tus usuarios.
4. Guarda en un administrador de contraseñas la contraseña de la base de datos.
5. Espera a que termine la creación.

### Aplicar el esquema

La forma más educativa es usar la CLI:

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
npx supabase functions deploy delete-account
```

El `project ref` aparece en **Project Settings → General**. Se aplicarán, en orden, `supabase/migrations/202608080001_nexus_cloud.sql` y `supabase/migrations/202608080002_catalog_and_event_sync.sql`. La segunda crea el catálogo normalizado y sus claves foráneas.

Alternativa: abre **SQL Editor**, copia la migración completa y ejecútala. La función `delete-account` sí debe publicarse con la CLI para que la eliminación total de cuentas funcione.

### Obtener las claves públicas

En **Project Settings → API** copia:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`.
- Publishable/anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

La clave anon es pública por diseño y las políticas RLS protegen los datos. Nunca copies `service_role` a `.env.local`, GitHub, Vercel ni Electron.

### Configurar autenticación local

En **Authentication → URL Configuration** configura inicialmente:

```text
Site URL: http://localhost:3000
Redirect URLs:
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset
```

En **Authentication → Providers → Email** conserva Email/Password activado. Para probar el flujo real, mantén la confirmación por correo activada.

## 4. Probar cuentas y sincronización

Completa `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA_ANON
NEXT_PUBLIC_APP_URL=http://localhost:3000

VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA_ANON
VITE_APP_URL=http://localhost:3000
```

Reinicia `npm run dev` y verifica:

1. Crear cuenta.
2. Confirmar el correo.
3. Iniciar sesión.
4. Marcar una película y un episodio.
5. Esperar a que el indicador muestre **Sincronizado**; no existe un botón manual.
6. Abrir una ventana privada, iniciar sesión y comprobar el progreso.
7. Crear un maratón y aceptar su invitación con otra cuenta.

## 5. Subir el código a GitHub

1. Crea un repositorio vacío en GitHub.
2. No subas `.env.local`.
3. Desde la carpeta de Nexus ejecuta, adaptando la URL:

```bash
git add .
git commit -m "Nexus MCU 1.0"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

Si el repositorio ya tiene un remoto, no repitas `git remote add origin`.

## 6. Crear el proyecto en Vercel

1. Entra en [Vercel](https://vercel.com/new).
2. Conecta GitHub.
3. Pulsa **Import** junto al repositorio de Nexus.
4. Comprueba que Vercel detecte **Next.js**.
5. No cambies el directorio raíz.
6. Añade estas variables en **Environment Variables**:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
```

En el primer despliegue puedes poner provisionalmente:

```text
NEXT_PUBLIC_APP_URL=https://TU-PROYECTO.vercel.app
```

7. Selecciona Node.js 22 o superior.
8. Pulsa **Deploy**.

Todos los pósteres, backdrops, logos y variantes de `public/` serán publicados por Vercel junto con la web. No deben subirse a Supabase Storage.

## 7. Conectar la URL definitiva

Cuando Vercel muestre la URL real:

1. Actualiza `NEXT_PUBLIC_APP_URL` en Vercel.
2. En Supabase cambia **Site URL** por esa URL.
3. Añade:

```text
https://TU-PROYECTO.vercel.app/auth/callback
https://TU-PROYECTO.vercel.app/auth/reset
https://*-TU-USUARIO.vercel.app/auth/callback
https://*-TU-USUARIO.vercel.app/auth/reset
```

Los comodines permiten probar previews de Vercel. En producción puedes restringirlos a dominios conocidos.

4. En Vercel abre **Deployments**, selecciona el último despliegue y pulsa **Redeploy**.

## 8. Preparar Nexus Desktop con la misma nube

Las variables `VITE_` se incorporan durante la compilación de Electron. Después de rellenarlas ejecuta:

```bash
npm run desktop:make
```

Antes de crear el instalador definitivo configura la URL del icono Squirrel:

PowerShell:

```powershell
$env:NEXUS_ICON_URL="https://TU-PROYECTO.vercel.app/icon-512.png"
npm run desktop:make
```

Las sesiones de Electron se cifran mediante la protección de Windows y el progreso offline se refleja en SQLite.

## 9. Comprobaciones después del despliegue

- La portada permite iniciar sesión, registrarse o continuar como invitado.
- La PWA se puede instalar desde Chrome o Edge.
- Los 897 recursos visuales responden correctamente.
- Registro, confirmación, login, logout y recuperación funcionan.
- Dos navegadores sincronizan progreso.
- Los perfiles infantiles no son públicos.
- Una invitación caducada es rechazada.
- Las notas privadas no aparecen en perfiles compartidos.
- Eliminar cuenta borra el usuario de Supabase Auth.
- La aplicación funciona con Internet desconectado después de una primera visita.

## 10. Actualizaciones y reversión

Cada `git push` a `main` genera un nuevo despliegue. Vercel conserva despliegues anteriores; si una versión falla, abre **Deployments**, selecciona la versión estable y utiliza **Promote to Production**.

Antes de modificar el esquema cloud, crea siempre otra migración. No edites una migración que ya se aplicó en producción.
