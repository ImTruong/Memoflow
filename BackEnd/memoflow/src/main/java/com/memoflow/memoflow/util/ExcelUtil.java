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

    public CreateListeningLessonRequest parseToCreateListeningLessonRequest(MultipartFile excelFile) throws IOException {
        Workbook workbook = WorkbookFactory.create(excelFile.getInputStream());
        DataFormatter formatter = new DataFormatter();
        Sheet sheet = workbook.getSheetAt(0);

        CreateListeningLessonRequest request = new CreateListeningLessonRequest();
        List<CreateListeningLessonRequest.ListeningGroupRequest> groups = new ArrayList<>();

        String lessonTitle = null;
        Integer lessonPart = null;

        Map<String, CreateListeningLessonRequest.ListeningGroupRequest> groupMap = new LinkedHashMap<>();
        Map<String, CreateListeningLessonRequest.ListeningQuizRequest> questionMap = new LinkedHashMap<>();

        int groupIndex = 0;

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String title = formatter.formatCellValue(row.getCell(0));
            String partStr = formatter.formatCellValue(row.getCell(1));
            String groupType = formatter.formatCellValue(row.getCell(2));
            String transcript = formatter.formatCellValue(row.getCell(3));
            String groupTranslation = formatter.formatCellValue(row.getCell(4));
            String hasAudioStr = formatter.formatCellValue(row.getCell(5));
            String hasImageStr = formatter.formatCellValue(row.getCell(6));
            String questionText = formatter.formatCellValue(row.getCell(7));
            String questionTranslation = formatter.formatCellValue(row.getCell(8));
            String optionText = formatter.formatCellValue(row.getCell(9));
            String isCorrectStr = formatter.formatCellValue(row.getCell(10));

            if (lessonTitle == null && !title.isEmpty()) {
                lessonTitle = title;
            }
            if (lessonPart == null && !partStr.isEmpty()) {
                lessonPart = Integer.parseInt(partStr);
            }

            CellRangeAddress groupRegion = getMergedRegion(sheet, i, 3);

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
                gReq.setType(formatter.formatCellValue(baseRow.getCell(2)));
                gReq.setTranscript(formatter.formatCellValue(baseRow.getCell(3)));
                gReq.setTranslation(formatter.formatCellValue(baseRow.getCell(4)));
                gReq.setHasAudio(Boolean.parseBoolean(formatter.formatCellValue(baseRow.getCell(5))));
                gReq.setHasImage(Boolean.parseBoolean(formatter.formatCellValue(baseRow.getCell(6))));
                gReq.setQuizzes(new ArrayList<>());

                groupMap.put(groupKey, gReq);
                groups.add(gReq);
            }

            CellRangeAddress questionRegion = getMergedRegion(sheet, i, 7);

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
                qReq.setQuestionText(formatter.formatCellValue(baseRow.getCell(7)));
                qReq.setTranslation(formatter.formatCellValue(baseRow.getCell(8)));
                qReq.setOptions(new ArrayList<>());

                gReq.getQuizzes().add(qReq);
                questionMap.put(questionKey, qReq);
            }

            if (!optionText.isEmpty()) {
                CreateListeningLessonRequest.ListeningOptionRequest oReq =
                        new CreateListeningLessonRequest.ListeningOptionRequest();

                oReq.setOrderIndex(qReq.getOptions().size() + 1);
                oReq.setOptionText(optionText);
                oReq.setIsCorrect(Boolean.parseBoolean(isCorrectStr));

                qReq.getOptions().add(oReq);
            }
        }

        request.setTitle(lessonTitle);
        request.setPart(lessonPart != null ? lessonPart : 0);
        request.setGroups(groups);

        workbook.close();
        return request;
    }

    private CellRangeAddress getMergedRegion(Sheet sheet, int row, int col) {
        for (CellRangeAddress region : sheet.getMergedRegions()) {
            if (region.isInRange(row, col)) {
                return region;
            }
        }
        return null;
    }

    public CreateBilingualLessonRequest parseToCreateBilingualLessonRequest(MultipartFile excelFile) throws IOException {

        Workbook workbook = WorkbookFactory.create(excelFile.getInputStream());
        DataFormatter formatter = new DataFormatter();
        Sheet sheet = workbook.getSheetAt(0);

        CreateBilingualLessonRequest request = new CreateBilingualLessonRequest();
        List<CreateBilingualLessonRequest.Paragraph> paragraphs = new ArrayList<>();

        String lessonTitle = null;
        String lessonDescription = null;

        int order = 0;

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String title = formatter.formatCellValue(row.getCell(0));
            String description = formatter.formatCellValue(row.getCell(1));
            String en = formatter.formatCellValue(row.getCell(2));
            String vi = formatter.formatCellValue(row.getCell(3));

            if (lessonTitle == null) {
                CellRangeAddress titleRegion = getMergedRegion(sheet, i, 0);
                int baseRow = (titleRegion != null) ? titleRegion.getFirstRow() : i;
                Row base = sheet.getRow(baseRow);
                String val = formatter.formatCellValue(base.getCell(0));
                if (!val.isEmpty()) lessonTitle = val;
            }

            if (lessonDescription == null) {
                CellRangeAddress descRegion = getMergedRegion(sheet, i, 1);
                int baseRow = (descRegion != null) ? descRegion.getFirstRow() : i;
                Row base = sheet.getRow(baseRow);
                String val = formatter.formatCellValue(base.getCell(1));
                if (!val.isEmpty()) lessonDescription = val;
            }

            if (en.isEmpty() && vi.isEmpty()) continue;

            order++;

            CreateBilingualLessonRequest.Paragraph p = new CreateBilingualLessonRequest.Paragraph();
            p.setOrder(order);
            p.setEn(en);
            p.setVi(vi);

            paragraphs.add(p);
        }

        CreateBilingualLessonRequest.Content content = new CreateBilingualLessonRequest.Content();
        content.setParagraphs(paragraphs);

        request.setTitle(lessonTitle);
        request.setDescription(lessonDescription);
        request.setContent(content);

        workbook.close();
        return request;
    }
}
