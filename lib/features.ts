// Configure at build time and on the server. Local development stays enabled.
export function isProjectPlannerEnabled() {
    return process.env.OPAC_PROJECT_PLANNER_ENABLED !== 'false';
}

export function projectPlannerUnavailable() {
    return Response.json({ error: 'Project planning is temporarily unavailable.' }, {
        status: 404, headers: { 'Cache-Control': 'no-store' },
    });
}
