# AI_MASTER_LOG.md — escala-irmas-2026-mar

> Diário de bordo do projeto (cronológico). Registrar ao fim de cada passo importante.

---

## [30/06/2026] Protocolo ENGINEERING_LOOP v2.0 adicionado a este repo + skill global

**O quê.** Adicionados `ENGINEERING_LOOP.md` (protocolo universal de loop de engenharia, v2.0) e `TAREFA_ATUAL.md` na raiz; `CLAUDE.md` aponta para o protocolo. Este repo passa a operar pelo loop (Orientar→Planejar→Executar→Verificar→Registrar→Decidir) com os três freios e maker–checker.

**Correção honesta (skill global).** A skill `engineering-loop` foi tornada global. O **Claude Code** lê `~/.claude/skills/` (vale em todos os projetos), mas o **Claude Desktop/Cowork NÃO lê essa pasta** — nele a skill entra instalando o arquivo `.skill` (Configurações > Skills). São dois mecanismos distintos. A suposição inicial de "instala 1× e vale nas duas superfícies" estava errada.
