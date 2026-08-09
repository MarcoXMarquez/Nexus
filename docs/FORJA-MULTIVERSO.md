# Forja del Multiverso — diseño futuro

Este documento planifica una colección opcional de pósteres. No está implementada ni activa en la aplicación.

## Principio

El usuario colecciona variantes de marco, no imágenes diferentes. El póster original mantiene su identidad y puede aparecer con rareza Bronce, Plata, Oro, Diamante o Adamantium. No se venderán tiradas con dinero real en la primera versión.

## Obtención propuesta

- Una apertura gratuita diaria.
- Fichas ganadas por ver títulos, completar capítulos, maratones y logros.
- Ninguna recompensa por marcar y desmarcar repetidamente el mismo título.
- Probabilidades visibles antes de abrir.

Distribución inicial a validar con telemetría anónima:

| Rareza     | Probabilidad |
| ---------- | -----------: |
| Bronce     |         45 % |
| Plata      |         30 % |
| Oro        |         17 % |
| Diamante   |        6,5 % |
| Adamantium |        1,5 % |

## Protección al usuario

- Garantía Oro o superior cada 10 aperturas.
- Garantía Diamante o superior cada 40.
- Adamantium garantizado a las 100 si no apareció antes.
- Duplicados se convierten en fragmentos; nunca desaparecen sin compensación.
- Historial verificable de aperturas y contador de garantía.
- Animación breve, omisible y compatible con movimiento reducido.

## Pantallas

1. **Forja:** saldo, probabilidades, garantía y botón de apertura.
2. **Revelado:** marco, rareza, duplicado y fragmentos recibidos.
3. **Colección:** filtros por universo, rareza, personaje y faltantes.
4. **Detalle:** póster, copias, fecha, origen y opción de exhibir.
5. **Showcase:** selección pública del perfil, nunca la colección completa por defecto.

## Backend planeado

- `collectible_definitions`: póster y reglas de elegibilidad.
- `profile_collectibles`: rareza, copias y primera obtención.
- `forge_wallets`: fichas y fragmentos.
- `forge_openings`: resultado inmutable, probabilidad y semilla auditada.
- `forge_pity`: contadores por perfil.

La apertura debe ejecutarse en una función de servidor transaccional. El cliente no decide rareza, saldo ni resultado. RLS permite al usuario leer su colección, pero no insertar recompensas.

## Antes de construirla

Validar primero retención sin mecánicas de azar, consentimiento, controles infantiles, accesibilidad, legislación aplicable y costes. Si perjudica la experiencia de seguimiento, debe poder desactivarse completamente.
