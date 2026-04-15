# BancoUM - Sistema de Gestión Bancaria Institucional

BancoUM es una plataforma moderna, segura e interactiva diseñada para la gestión integral de productos financieros y clientes. Desarrollada con un enfoque "glassmorfista" y UX intuitiva, permite operaciones bancarias en tiempo real, administración de roles y auditoría profunda de movimientos.

## 🚀 Descripción del Proyecto

Este sistema bancario fue diseñado bajo una arquitectura web de última generación, priorizando la experiencia de usuario (UX) mediante una interfaz interactiva, limpia y rápida, al mismo tiempo que garantiza la integridad, seguridad y trazabilidad de cada transacción en la base de datos subyacente.

## 🛠️ Stack Tecnológico

El proyecto está soportado por un ecosistema Fullstack Serverless:
*   **Frontend:** React 19, Next.js (App Router), Tailwind CSS v4, Lucide React.
*   **Backend & API:** Next.js Serverless Functions (Route Handlers).
*   **Autenticación:** NextAuth.js (v4) con custom credentials provider.
*   **Base de Datos & ORM:** PostgreSQL (Supabase), Prisma ORM.
*   **Mapas e Integraciones:** React-Leaflet y Nominatim API (OpenStreetMap).
*   **Despliegue:** Vercel (Frontend), Supabase (Base de Datos).

## 👩‍💻 Roles del Sistema

| Rol | Nivel de Acceso | Descripción |
| :--- | :--- | :--- |
| **CLIENTE** | Básico / Consumidor | Acceso a sus propias cuentas, tarjeta virtual, historial de movimientos, realizar transferencias y gestionar su perfil. |
| **ASESOR** | Operativo | Encargado del servicio al cliente. Puede crear cuentas, visualizar listados de clientes y ver transacciones. |
| **OPERADOR** | Infraestructura | Controla la red física del banco. Crea y edita puntos de atención (sucursales, cajeros), gestiona empleados y tipos de cuentas. |
| **ADMIN** | Total / Auditoría | Visión global. Administra accesos de usuarios, revisa dashboards estadísticos y analiza los logs de auditoría general. |

## 🔒 Seguridad

*   Protección de rutas con Middleware de NextAuth.
*   Cifrado de contraseñas de sesión (Bcrypt).
*   Manejo de estados ACID en las transacciones directamente en la base de datos PostgreSQL.
*   Consultas parametrizadas (Prevenidas contra SQL Injection vía Prisma ORM).

---
*Desarrollado para la asignatura Sistemas de Bases de Datos II - Universidad de Manizales.*
