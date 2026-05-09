package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SyllabusRecord representa un sílabo registrado en la blockchain.
type SyllabusRecord struct {
	DocID           string `json:"docID"`
	CourseID        string `json:"courseID"`
	FileName        string `json:"fileName"`
	FileType        string `json:"fileType"`
	FileSize        int64  `json:"fileSize"`
	FileHash        string `json:"fileHash"` // SHA-256 hex
	UploaderEmail   string `json:"uploaderEmail"`
	InstitutionName string `json:"institutionName"`
	Action          string `json:"action"`
	Timestamp       string `json:"timestamp"`
	BlockchainTime  string `json:"blockchainTime"` // time.Now() al momento del commit
}

type SmartContract struct {
	contractapi.Contract
}

// RegisterSyllabus escribe un nuevo registro en el ledger.
func (s *SmartContract) RegisterSyllabus(ctx contractapi.TransactionContextInterface,
	docID, courseID, fileName, fileType string, fileSize int64,
	fileHash, uploaderEmail, institutionName, action, timestamp string) error {

	existing, err := ctx.GetStub().GetState(docID)
	if err != nil {
		return fmt.Errorf("error leyendo ledger: %w", err)
	}
	if existing != nil {
		return fmt.Errorf("docID '%s' ya existe en el ledger", docID)
	}

	record := SyllabusRecord{
		DocID:           docID,
		CourseID:        courseID,
		FileName:        fileName,
		FileType:        fileType,
		FileSize:        fileSize,
		FileHash:        fileHash,
		UploaderEmail:   uploaderEmail,
		InstitutionName: institutionName,
		Action:          action,
		Timestamp:       timestamp,
		BlockchainTime:  time.Now().UTC().Format(time.RFC3339),
	}

	recordJSON, err := json.Marshal(record)
	if err != nil {
		return fmt.Errorf("error serializando record: %w", err)
	}

	return ctx.GetStub().PutState(docID, recordJSON)
}

// GetSyllabus lee un registro por docID.
func (s *SmartContract) GetSyllabus(ctx contractapi.TransactionContextInterface, docID string) (*SyllabusRecord, error) {
	data, err := ctx.GetStub().GetState(docID)
	if err != nil {
		return nil, fmt.Errorf("error leyendo ledger: %w", err)
	}
	if data == nil {
		return nil, fmt.Errorf("docID '%s' no encontrado", docID)
	}

	var record SyllabusRecord
	if err := json.Unmarshal(data, &record); err != nil {
		return nil, err
	}
	return &record, nil
}

// VerifyHash comprueba si el hash coincide con el registrado para ese docID.
func (s *SmartContract) VerifyHash(ctx contractapi.TransactionContextInterface, docID, fileHash string) (bool, error) {
	record, err := s.GetSyllabus(ctx, docID)
	if err != nil {
		return false, err
	}
	return record.FileHash == fileHash, nil
}

// GetSyllabiBycourse devuelve todos los registros de un curso (rich query CouchDB).
func (s *SmartContract) GetSyllabiByourse(ctx contractapi.TransactionContextInterface, courseID string) ([]*SyllabusRecord, error) {
	query := fmt.Sprintf(`{"selector":{"courseID":"%s"}}`, courseID)
	iter, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, err
	}
	defer iter.Close()

	var results []*SyllabusRecord
	for iter.HasNext() {
		result, err := iter.Next()
		if err != nil {
			return nil, err
		}
		var record SyllabusRecord
		if err := json.Unmarshal(result.Value, &record); err != nil {
			return nil, err
		}
		results = append(results, &record)
	}
	return results, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		panic(fmt.Sprintf("Error creating chaincode: %v", err))
	}
	if err := chaincode.Start(); err != nil {
		panic(fmt.Sprintf("Error starting chaincode: %v", err))
	}
}
