// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MedJournal
 * @dev Smart contract for storing verified health journal entry hashes on blockchain
 * @notice This contract allows users to store tamper-proof health records
 */
contract MedJournal {
    
    struct HealthEntry {
        bytes32 dataHash;      // Hash of the health entry data
        uint256 timestamp;     // Block timestamp when entry was recorded
        address user;          // Address of the user who recorded the entry
        string ipfsHash;       // Optional: IPFS hash for additional data storage
    }
    
    // Mapping from user address to array of their health entries
    mapping(address => HealthEntry[]) public userEntries;
    
    // Mapping from data hash to entry details for quick lookup
    mapping(bytes32 => HealthEntry) public entryByHash;
    
    // Total number of entries recorded
    uint256 public totalEntries;
    
    // Events
    event HealthEntryRecorded(
        address indexed user,
        bytes32 indexed dataHash,
        uint256 timestamp,
        string ipfsHash
    );
    
    event EntryVerified(
        bytes32 indexed dataHash,
        address indexed verifier,
        uint256 timestamp
    );
    
    /**
     * @dev Record a new health entry hash on the blockchain
     * @param _dataHash Hash of the health entry data (symptoms, mood, severity, etc.)
     * @param _ipfsHash Optional IPFS hash for storing additional data
     */
    function recordEntry(bytes32 _dataHash, string memory _ipfsHash) external {
        require(_dataHash != bytes32(0), "Data hash cannot be empty");
        require(entryByHash[_dataHash].timestamp == 0, "Entry already exists");
        
        HealthEntry memory newEntry = HealthEntry({
            dataHash: _dataHash,
            timestamp: block.timestamp,
            user: msg.sender,
            ipfsHash: _ipfsHash
        });
        
        userEntries[msg.sender].push(newEntry);
        entryByHash[_dataHash] = newEntry;
        totalEntries++;
        
        emit HealthEntryRecorded(msg.sender, _dataHash, block.timestamp, _ipfsHash);
    }
    
    /**
     * @dev Get all entries for a specific user
     * @param _user Address of the user
     * @return Array of HealthEntry structs
     */
    function getUserEntries(address _user) external view returns (HealthEntry[] memory) {
        return userEntries[_user];
    }
    
    /**
     * @dev Get the number of entries for a specific user
     * @param _user Address of the user
     * @return Number of entries
     */
    function getUserEntryCount(address _user) external view returns (uint256) {
        return userEntries[_user].length;
    }
    
    /**
     * @dev Verify if a specific data hash exists and get its details
     * @param _dataHash Hash to verify
     * @return exists Whether the hash exists
     * @return user Address of the user who recorded it
     * @return timestamp When it was recorded
     * @return ipfsHash Associated IPFS hash
     */
    function verifyEntry(bytes32 _dataHash) external view returns (
        bool exists,
        address user,
        uint256 timestamp,
        string memory ipfsHash
    ) {
        HealthEntry memory entry = entryByHash[_dataHash];
        exists = entry.timestamp != 0;
        user = entry.user;
        timestamp = entry.timestamp;
        ipfsHash = entry.ipfsHash;
        
        if (exists) {
            emit EntryVerified(_dataHash, msg.sender, block.timestamp);
        }
    }
    
    /**
     * @dev Get entry details by hash
     * @param _dataHash Hash to look up
     * @return HealthEntry struct
     */
    function getEntryByHash(bytes32 _dataHash) external view returns (HealthEntry memory) {
        require(entryByHash[_dataHash].timestamp != 0, "Entry does not exist");
        return entryByHash[_dataHash];
    }
    
    /**
     * @dev Check if a data hash is already recorded
     * @param _dataHash Hash to check
     * @return bool Whether the hash exists
     */
    function entryExists(bytes32 _dataHash) external view returns (bool) {
        return entryByHash[_dataHash].timestamp != 0;
    }
}