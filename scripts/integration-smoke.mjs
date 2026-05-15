const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, init) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  return { res, body };
}

async function waitForServer(maxAttempts = 45) {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const { res } = await request("/api/animals");
      if (res.ok) return true;
    } catch {
      // retry
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Server did not become ready in time.");
}

async function run() {
  console.log(`Running smoke tests against ${BASE_URL}`);
  await waitForServer();

  const { res: animalsRes, body: animalsBody } = await request("/api/animals");
  assert(animalsRes.status === 200, `GET /api/animals failed (${animalsRes.status})`);
  assert(Array.isArray(animalsBody?.animals), "GET /api/animals returned invalid payload");
  console.log(`PASS GET /api/animals -> ${animalsBody.animals.length} animals`);

  assert(animalsBody.animals.length > 0, "No animals found; cannot run mutation tests.");
  const targetAnimal = animalsBody.animals[0];
  assert(typeof targetAnimal.name === "string" && targetAnimal.name.length > 0, "Expected animal name.");

  const { res: adoptionsRes, body: adoptionsBody } = await request("/api/adoptions");
  assert(adoptionsRes.status === 200, `GET /api/adoptions failed (${adoptionsRes.status})`);
  assert(Array.isArray(adoptionsBody?.applications), "GET /api/adoptions returned invalid payload");
  console.log(`PASS GET /api/adoptions -> ${adoptionsBody.applications.length} applications`);

  const { res: vaccinationsRes, body: vaccinationsBody } = await request("/api/vaccinations");
  assert(vaccinationsRes.status === 200, `GET /api/vaccinations failed (${vaccinationsRes.status})`);
  assert(Array.isArray(vaccinationsBody?.vaccinations), "GET /api/vaccinations returned invalid payload");
  console.log(`PASS GET /api/vaccinations -> ${vaccinationsBody.vaccinations.length} records`);

  const baseVaccination = vaccinationsBody.vaccinations[0];
  const numericAnimalId = Number.isInteger(baseVaccination?.animalId) ? baseVaccination.animalId : 1;
  const numericAnimalName = typeof baseVaccination?.animalName === "string" && baseVaccination.animalName
    ? baseVaccination.animalName
    : targetAnimal.name;

  const createVaccPayload = {
    animalId: numericAnimalId,
    animalName: numericAnimalName,
    vaccineName: "Integration Test Vaccine",
    dose: "Booster",
    dateGiven: "2026-05-10",
    nextDueDate: "2026-06-10",
    notes: "Created by integration smoke test",
  };

  const { res: createVaccRes, body: createVaccBody } = await request("/api/vaccinations", {
    method: "POST",
    body: JSON.stringify(createVaccPayload),
  });

  assert(createVaccRes.status === 201, `POST /api/vaccinations failed (${createVaccRes.status})`);
  const createdVaccination = createVaccBody?.vaccinations?.[0];
  assert(createdVaccination?.id, "POST /api/vaccinations did not return created vaccination");
  console.log(`PASS POST /api/vaccinations -> created id ${createdVaccination.id}`);

  const { res: animalVaccRes, body: animalVaccBody } = await request(`/api/animals/${numericAnimalId}/vaccinations`);
  assert(animalVaccRes.status === 200, `GET /api/animals/:id/vaccinations failed (${animalVaccRes.status})`);
  assert(Array.isArray(animalVaccBody?.vaccinations), "Invalid animal vaccination payload");
  console.log(`PASS GET /api/animals/${numericAnimalId}/vaccinations -> ${animalVaccBody.vaccinations.length} records`);

  const { res: updateVaccRes } = await request(`/api/vaccinations/${createdVaccination.id}`, {
    method: "PUT",
    body: JSON.stringify({ status: "upcoming", notes: "Updated by integration smoke test" }),
  });
  assert(updateVaccRes.status === 200, `PUT /api/vaccinations/:id failed (${updateVaccRes.status})`);
  console.log(`PASS PUT /api/vaccinations/${createdVaccination.id}`);

  const createAdoptionPayload = {
    applicantName: "Integration Tester",
    email: "integration.tester@example.com",
    phone: "1234567890",
    city: "Test City",
    housing: "Apartment",
    petExperience: "Beginner",
    whyAdopt: "Automated smoke validation",
    animalId: numericAnimalId,
    animalName: numericAnimalName,
    animalCode: "",
  };

  const { res: createAdoptionRes, body: createAdoptionBody } = await request("/api/adoptions", {
    method: "POST",
    body: JSON.stringify(createAdoptionPayload),
  });

  assert(createAdoptionRes.status === 201, `POST /api/adoptions failed (${createAdoptionRes.status})`);
  const createdAdoption = createAdoptionBody?.application;
  assert(createdAdoption?.id, "POST /api/adoptions did not return created application");
  console.log(`PASS POST /api/adoptions -> created id ${createdAdoption.id}`);

  const { res: updateStatusRes } = await request(`/api/adoptions/${createdAdoption.id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: "shortlisted" }),
  });
  assert(updateStatusRes.status === 200, `PUT /api/adoptions/:id/status failed (${updateStatusRes.status})`);
  console.log(`PASS PUT /api/adoptions/${createdAdoption.id}/status`);

  const { res: deleteVaccRes } = await request(`/api/vaccinations/${createdVaccination.id}`, {
    method: "DELETE",
  });
  assert(deleteVaccRes.status === 200, `DELETE /api/vaccinations/:id failed (${deleteVaccRes.status})`);
  console.log(`PASS DELETE /api/vaccinations/${createdVaccination.id}`);

  console.log("All integration smoke tests passed.");
}

run().catch((error) => {
  console.error("Smoke tests failed:", error.message);
  process.exit(1);
});
