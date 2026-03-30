






// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PasswordVault is Ownable, ReentrancyGuard {
    // Password Entry Structure
    struct PasswordEntry {
        string site;           // Website or service name (e.g., "gmail.com")
        string username;       // Email or username
        string encryptedData;  // AES-encrypted password + optional metadata (base64 or hex)
        uint256 createdAt;
        uint256 updatedAt;
    }

    // Mapping: user address => array of their password entries
    mapping(address => PasswordEntry[]) private userVaults;

    // Events for frontend listening and transparency
    event PasswordStored(
        address indexed user,
        uint256 indexed entryId,
        string site,
        string username
    );

    event PasswordUpdated(
        address indexed user,
        uint256 indexed entryId,
        string site
    );

    event PasswordDeleted(
        address indexed user,
        uint256 indexed entryId
    );

    event VaultCleared(address indexed user);

    // Custom errors for better gas efficiency and clarity
    error EmptySite();
    error InvalidEntryIndex();
    error NoEntriesToClear();

    constructor() Ownable(msg.sender) {}

    // =============================================
    // 1. Store a new encrypted password entry
    // =============================================
    function storePassword(
        string calldata _site,
        string calldata _username,
        string calldata _encryptedData   // MUST be encrypted OFF-CHAIN (AES-GCM recommended)
    ) external nonReentrant {
        if (bytes(_site).length == 0) revert EmptySite();

        PasswordEntry memory newEntry = PasswordEntry({
            site: _site,
            username: _username,
            encryptedData: _encryptedData,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        uint256 entryId = userVaults[msg.sender].length;
        userVaults[msg.sender].push(newEntry);

        emit PasswordStored(msg.sender, entryId, _site, _username);
    }

    // =============================================
    // 2. Update an existing entry
    // =============================================
    function updatePassword(
        uint256 _entryId,
        string calldata _site,
        string calldata _username,
        string calldata _newEncryptedData
    ) external nonReentrant {
        if (_entryId >= userVaults[msg.sender].length) revert InvalidEntryIndex();
        if (bytes(_site).length == 0) revert EmptySite();

        PasswordEntry storage entry = userVaults[msg.sender][_entryId];

        entry.site = _site;
        entry.username = _username;
        entry.encryptedData = _newEncryptedData;
        entry.updatedAt = block.timestamp;

        emit PasswordUpdated(msg.sender, _entryId, _site);
    }

    // =============================================
    // 3. Delete a specific entry
    // =============================================
    function deletePassword(uint256 _entryId) external nonReentrant {
        if (_entryId >= userVaults[msg.sender].length) revert InvalidEntryIndex();

        uint256 lastIndex = userVaults[msg.sender].length - 1;

        // Swap with last element and pop (cheaper than shifting)
        userVaults[msg.sender][_entryId] = userVaults[msg.sender][lastIndex];
        userVaults[msg.sender].pop();

        emit PasswordDeleted(msg.sender, _entryId);
    }

    // =============================================
    // 4. Clear entire vault (emergency / reset)
    // =============================================
    function clearVault() external nonReentrant {
        if (userVaults[msg.sender].length == 0) revert NoEntriesToClear();

        delete userVaults[msg.sender];   // Gas efficient delete

        emit VaultCleared(msg.sender);
    }

    // =============================================
    // View Functions (gas
