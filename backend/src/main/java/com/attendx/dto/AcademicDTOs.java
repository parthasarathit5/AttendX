package com.attendx.dto;

import com.attendx.entity.AcademicYear;
import com.attendx.entity.DegreeClass;
import com.attendx.entity.Subject;

import java.time.LocalDate;
import java.util.List;

public class AcademicDTOs {

    public static class AcademicYearDTO {
        private String id;
        private String code;
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;
        private boolean isCurrent;
        private String status;

        public static AcademicYearDTO fromEntity(AcademicYear y) {
            AcademicYearDTO dto = new AcademicYearDTO();
            dto.setId(y.getId());
            dto.setCode(y.getCode());
            dto.setName(y.getName());
            dto.setStartDate(y.getStartDate());
            dto.setEndDate(y.getEndDate());
            dto.setCurrent(y.isCurrent());
            dto.setStatus(y.getStatus());
            return dto;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
        public boolean isCurrent() { return isCurrent; }
        public void setCurrent(boolean current) { isCurrent = current; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class DegreeClassDTO {
        private String id;
        private String code;
        private String name;
        private String department;
        private int yearOfStudy;
        private int semester;
        private List<String> sections;

        public static DegreeClassDTO fromEntity(DegreeClass c, List<String> sections) {
            DegreeClassDTO dto = new DegreeClassDTO();
            dto.setId(c.getId());
            dto.setCode(c.getCode());
            dto.setName(c.getName());
            dto.setDepartment(c.getDepartment());
            dto.setYearOfStudy(c.getYearOfStudy());
            dto.setSemester(c.getSemester());
            dto.setSections(sections);
            return dto;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public int getYearOfStudy() { return yearOfStudy; }
        public void setYearOfStudy(int yearOfStudy) { this.yearOfStudy = yearOfStudy; }
        public int getSemester() { return semester; }
        public void setSemester(int semester) { this.semester = semester; }
        public List<String> getSections() { return sections; }
        public void setSections(List<String> sections) { this.sections = sections; }
    }

    public static class SubjectDTO {
        private String id;
        private String code;
        private String name;
        private String department;
        private int credits;
        private int semester;

        public static SubjectDTO fromEntity(Subject s) {
            SubjectDTO dto = new SubjectDTO();
            dto.setId(s.getId());
            dto.setCode(s.getCode());
            dto.setName(s.getName());
            dto.setDepartment(s.getDepartment());
            dto.setCredits(s.getCredits());
            dto.setSemester(s.getSemester());
            return dto;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public int getCredits() { return credits; }
        public void setCredits(int credits) { this.credits = credits; }
        public int getSemester() { return semester; }
        public void setSemester(int semester) { this.semester = semester; }
    }
}

