package com.memoflow.memoflow.util;

import com.memoflow.memoflow.dto.request.CreateBilingualLessonRequest;
import com.memoflow.memoflow.dto.request.CreateListeningLessonRequest;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Component
public class ExcelUtil {

    public List<CreateListeningLessonRequest.ListeningGroupRequest> parseToListeningGroup(MultipartFile excelFile) throws IOException {

        Workbook workbook = WorkbookFactory.create(excelFile.getInputStream());
        DataFormatter formatter = new DataFormatter();
        Sheet sheet = workbook.getSheetAt(0);

        List<CreateListeningLessonRequest.ListeningGroupRequest> groups = new ArrayList<>();

        Map<String, CreateListeningLessonRequest.ListeningGroupRequest> groupMap = new LinkedHashMap<>();
        Map<String, CreateListeningLessonRequest.ListeningQuizRequest> questionMap = new LinkedHashMap<>();

        int groupIndex = 0;

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            // ===== READ DATA =====
            String transcript = formatter.formatCellValue(row.getCell(0));
            String translation = formatter.formatCellValue(row.getCell(1));
            String hasAudioStr = formatter.formatCellValue(row.getCell(2));
            String hasImageStr = formatter.formatCellValue(row.getCell(3));
            String questionText = formatter.formatCellValue(row.getCell(4));
            String questionTranslation = formatter.formatCellValue(row.getCell(5));
            String optionText = formatter.formatCellValue(row.getCell(6));
            String isCorrectStr = formatter.formatCellValue(row.getCell(7));

            // ===== GROUP (merge theo transcript - col 0) =====
            CellRangeAddress groupRegion = getMergedRegion(sheet, i, 0);

            String groupKey = (groupRegion != null)
                    ? "G-" + groupRegion.getFirstRow() + "-" + groupRegion.getLastRow()
                    : "G-row-" + i;

            CreateListeningLessonRequest.ListeningGroupRequest gReq = groupMap.get(groupKey);

            if (gReq == null) {
                groupIndex++;

                int baseRowIndex = (groupRegion != null) ? groupRegion.getFirstRow() : i;
                Row baseRow = sheet.getRow(baseRowIndex);

                gReq = new CreateListeningLessonRequest.ListeningGroupRequest();
                gReq.setOrderIndex(groupIndex);
                gReq.setType(""); // không dùng
                gReq.setTranscript(formatter.formatCellValue(baseRow.getCell(0)));
                gReq.setTranslation(formatter.formatCellValue(baseRow.getCell(1)));
                gReq.setHasAudio(Boolean.parseBoolean(formatter.formatCellValue(baseRow.getCell(2))));
                gReq.setHasImage(Boolean.parseBoolean(formatter.formatCellValue(baseRow.getCell(3))));
                gReq.setQuizzes(new ArrayList<>());

                groupMap.put(groupKey, gReq);
                groups.add(gReq);
            }

            // ===== QUESTION (merge theo questionText - col 4) =====
            CellRangeAddress questionRegion = getMergedRegion(sheet, i, 4);

            String questionKey = groupKey + "-" + (
                    questionRegion != null
                            ? "Q-" + questionRegion.getFirstRow() + "-" + questionRegion.getLastRow()
                            : "Q-row-" + i
            );

            CreateListeningLessonRequest.ListeningQuizRequest qReq = questionMap.get(questionKey);

            if (qReq == null) {
                int baseRowIndex = (questionRegion != null) ? questionRegion.getFirstRow() : i;
                Row baseRow = sheet.getRow(baseRowIndex);

                qReq = new CreateListeningLessonRequest.ListeningQuizRequest();
                qReq.setOrderIndex(gReq.getQuizzes().size() + 1);
                qReq.setQuestionText(formatter.formatCellValue(baseRow.getCell(4)));
                qReq.setTranslation(formatter.formatCellValue(baseRow.getCell(5)));
                qReq.setOptions(new ArrayList<>());

                gReq.getQuizzes().add(qReq);
                questionMap.put(questionKey, qReq);
            }

            // ===== OPTION =====
            if (!optionText.isEmpty()) {
                CreateListeningLessonRequest.ListeningOptionRequest oReq =
                        new CreateListeningLessonRequest.ListeningOptionRequest();

                oReq.setOrderIndex(qReq.getOptions().size() + 1);
                oReq.setType(""); // không dùng
                oReq.setOptionText(optionText);
                oReq.setIsCorrect(Boolean.parseBoolean(isCorrectStr));

                qReq.getOptions().add(oReq);
            }
        }

        workbook.close();
        return groups;
    }

    private CellRangeAddress getMergedRegion(Sheet sheet, int row, int col) {
        for (CellRangeAddress region : sheet.getMergedRegions()) {
            if (region.isInRange(row, col)) {
                return region;
            }
        }
        return null;
    }

    public List<CreateBilingualLessonRequest.Paragraph> parseToBilingualParagraphs(MultipartFile excelFile) throws IOException {

        Workbook workbook = WorkbookFactory.create(excelFile.getInputStream());
        DataFormatter formatter = new DataFormatter();
        Sheet sheet = workbook.getSheetAt(0);
        List<CreateBilingualLessonRequest.Paragraph> paragraphs = new ArrayList<>();
        int order = 0;
        for (int i = 1; i <= sheet.getLastRowNum(); i++) { // bỏ header
            Row row = sheet.getRow(i);
            if (row == null) continue;
            String en = formatter.formatCellValue(row.getCell(0));
            String vi = formatter.formatCellValue(row.getCell(1));
            if (en.isBlank() && vi.isBlank()) continue;
            order++;
            CreateBilingualLessonRequest.Paragraph p = new CreateBilingualLessonRequest.Paragraph();
            p.setOrder(order);
            p.setEn(en.trim());
            p.setVi(vi.trim());
            paragraphs.add(p);
        }
        workbook.close();
        return paragraphs;
    }
}
