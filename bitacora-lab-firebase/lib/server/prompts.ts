export function buildClassifierPrompt(ideas: { id: string; desc: string }[], text: string) {
  return `Actúa como un evaluador experto. Tu tarea es analizar semánticamente la respuesta de un estudiante en base a una lista estricta de ideas clave esperadas.

NO exijas términos exactos o tecnicismos específicos si la semántica de la respuesta del estudiante demuestra claramente comprensión de la idea conceptual.

Analiza las siguientes ideas clave requeridas:
${JSON.stringify(ideas, null, 2)}

<texto_estudiante>
${text}
</texto_estudiante>

Instrucciones:
1. Evalúa si la respuesta del estudiante cubre conceptualmente cada idea requerida. 
2. Para cada idea, clasifica su estado como:
   - "covered": El estudiante abordó la idea satisfactoriamente con sus propias palabras.
   - "partial": El estudiante rozó la idea, fue muy ambiguo, o le faltó un matiz clave.
   - "missing": El estudiante no mencionó la idea o su explicación es incorrecta para ese punto.
3. Para cada idea, proporciona una "evidence" (evidencia) de máximo 12 palabras justificando tu clasificación, citando brevemente al estudiante.
4. Determina si el texto parece haber sido copiado textualmente (o casi textualmente) de las instrucciones genéricas de un laboratorio, consola o documentación técnica, estableciendo 'copiedFromLab' como true o false.

Devuelve EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura (no incluyas markdown ni bloques de código extra):
{
  "ideasStatus": {
    "idea_id_1": { "status": "covered|partial|missing", "evidence": "razón breve" },
    "idea_id_2": { "status": "...", "evidence": "..." }
  },
  "copiedFromLab": boolean
}`;
}
