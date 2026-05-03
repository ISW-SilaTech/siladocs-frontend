# Backend Integration Guide - Carga Masiva Phase 1

## Current State
The frontend has been enhanced to send complete entity data (Careers, Curricula, Courses) in the bulk upload. However, the backend currently only searches for existing entities and fails if they don't exist.

## Required Backend Changes

### 1. Update BulkCourseRequestDto Structure
The frontend now sends the following JSON structure:

```json
[
  {
    "carrera": {
      "nombre": "Ingeniería de Sistemas",
      "facultad": "Ingeniería",
      "ciclos": 10,
      "estado": "Activo"
    },
    "malla": {
      "nombre": "Sistemas - Plan 2024",
      "año": 2024,
      "numCursos": 50,
      "creditos": 200,
      "descripcion": "Plan actualizado con IA",
      "estado": "Activo"
    },
    "curso": {
      "codigo": "SIS101",
      "nombre": "Introducción a la Computación",
      "ciclo": 1,
      "año": 2024,
      "estado": "Activo",
      "fechaPublicacion": "2024-01-15"
    }
  }
]
```

### 2. Update Controller Logic (BulkUploadController.java)

The `uploadCourses()` method should implement the following logic:

```java
public BulkUploadResult uploadCourses(
    @RequestBody List<BulkCourseRequestDto> requests,
    Authentication authentication
) {
    // For each request:
    for (BulkCourseRequestDto req : requests) {
        try {
            // Step 1: Find or create Career
            Career career = careerService.findByName(req.getCarrera().getNombre())
                .orElseGet(() -> careerService.create(
                    new Career(
                        req.getCarrera().getNombre(),
                        req.getCarrera().getFacultad(),
                        req.getCarrera().getCiclos(),
                        req.getCarrera().getEstado()
                    )
                ));

            // Step 2: Find or create Curriculum (Malla)
            Curriculum curriculum = curriculumService
                .findByNameAndCareer(req.getMalla().getNombre(), career.getId())
                .orElseGet(() -> curriculumService.create(
                    new Curriculum(
                        career.getId(),
                        req.getMalla().getNombre(),
                        req.getMalla().getAño(),
                        req.getMalla().getNumCursos(),
                        req.getMalla().getCreditos(),
                        req.getMalla().getDescripcion(),
                        req.getMalla().getEstado()
                    )
                ));

            // Step 3: Find or create Course
            Course course = courseService
                .findByCode(req.getCurso().getCodigo())
                .orElseGet(() -> courseService.create(
                    new Course(
                        career.getId(),
                        curriculum.getId(),
                        req.getCurso().getCodigo(),
                        req.getCurso().getNombre(),
                        career.getFaculty(), // Use career's faculty
                        req.getCurso().getCiclo(),
                        req.getCurso().getAño(),
                        req.getCurso().getEstado(),
                        req.getCurso().getFechaPublicacion()
                    )
                ));

            successCount++;
        } catch (Exception e) {
            errors.add("Error processing row: " + e.getMessage());
        }
    }

    return new BulkUploadResult(successCount, errors);
}
```

### 3. Required Service Methods

#### CareerService
```java
Optional<Career> findByName(String name);
Career create(Career career);  // Should also handle duplicate name checks
```

#### CurriculumService
```java
Optional<Curriculum> findByNameAndCareer(String name, Long careerId);
Curriculum create(Curriculum curriculum);
```

#### CourseService
```java
Optional<Course> findByCode(String code);
Course create(Course course);  // Should ensure code uniqueness per institution
```

### 4. Key Implementation Details

#### Duplicate Handling
- **Careers**: Search by name (case-insensitive). If exists, use existing; if not, create new.
- **Curriculums (Mallas)**: Search by (name + career_id) combination. A career can have multiple mallas with different names.
- **Courses**: Search by code (case-insensitive). If exists, log a warning but use existing; if not, create new.

#### Default Values
If not provided in the request:
- `career.estado`: "Activo"
- `malla.estado`: "Activo"
- `curso.estado`: "Activo"
- `curso.ciclo`: 1
- `curso.año`: current year

#### Transaction Management
Wrap the entire bulk operation in a transaction to ensure consistency. If one row fails, it should not affect others (partial success is allowed - return 207 Multi-Status).

#### Validation
- Career name: required, max 255 chars
- Curriculum name: required, max 255 chars
- Course code: required, max 50 chars, must be unique per institution
- Course name: required, max 255 chars
- Ciclo (cycle): must be numeric (1-10 range recommended)
- Year: must be valid year format
- Creditos: must be numeric (0-300 range recommended)

### 5. Updated DTO Classes

#### CareerDto
```java
@Data
public class CareerDto {
    private String nombre;
    private String facultad;
    private Integer ciclos;
    private String estado;
}
```

#### MallaDto
```java
@Data
public class MallaDto {
    private String nombre;
    private Integer año;
    private Integer numCursos;
    private Integer creditos;
    private String descripcion;
    private String estado;
}
```

#### CursoDto
```java
@Data
public class CursoDto {
    private String codigo;
    private String nombre;
    private Integer ciclo;
    private Integer año;
    private String estado;
    private String fechaPublicacion;
}
```

#### BulkCourseRequestDto (Updated)
```java
@Data
public class BulkCourseRequestDto {
    private CarreraDto carrera;
    private MallaDto malla;
    private CursoDto curso;
}
```

### 6. Response Format

The response format remains the same:

```json
{
  "successCount": 8,
  "errors": []
}
```

For partial success (207):
```json
{
  "successCount": 6,
  "errors": [
    "Row 2: Course code 'SIS101' already exists - using existing",
    "Row 5: Invalid year format"
  ]
}
```

### 7. HTTP Status Codes

- **201 Created**: All records processed successfully
- **207 Multi-Status**: Partial success (some rows succeeded, some failed)
- **400 Bad Request**: Validation error or malformed JSON
- **401 Unauthorized**: Authentication failed
- **500 Internal Server Error**: Server-side error

## Testing Checklist

- [ ] Create new career + malla + course
- [ ] Update existing malla with new course
- [ ] Duplicate course code detection
- [ ] Invalid year/ciclo handling
- [ ] Large batch processing (100+ records)
- [ ] Transaction rollback on critical failure
- [ ] Concurrent bulk uploads from different users

## Frontend Status

✅ Frontend enhanced to send complete entity data
✅ Phase 1 validation working correctly
✅ Phase 2 (Syllabus blockchain upload) ready to use once courses exist

⏳ Awaiting backend implementation to enable automatic creation of Careers, Curricula, and Courses

## Next Steps

1. Update backend DTOs and controller logic as specified above
2. Test with the provided template Excel file
3. Once Phase 1 succeeds, Phase 2 will automatically load courses for syllabus upload
