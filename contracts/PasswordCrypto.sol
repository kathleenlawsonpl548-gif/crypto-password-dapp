// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PasswordCrypto {
    address public owner;

    // Password entry structure for the manager part
    struct PasswordEntry {
        string site;           // e.g., "gmail.com"
        string username;       // e.g., "user@example.com"
        string encryptedPass;  // AES-encrypted password (or similar) - encrypted OFF-CHAIN
        uint256 timestamp;
    }

    mapping(address => PasswordEntry[]) public userPasswords;
    mapping(address => uint256) public userPasswordCount;

    event PasswordGenerated(address indexed user, string password, uint256 length);
    event PasswordStored(address indexed user, string site, uint256 entryId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // =============================================
    // 1. On-chain Pseudo-Random Password Generator
    // =============================================
    function generatePassword(
        uint256 length,           // Desired password length (8-32 recommended)
        uint256 userSeed,         // User-provided entropy (e.g., timestamp + random input)
        bool includeUpper,        // Include A-Z
        bool includeLower,        // Include a-z
        bool includeNumbers,      // Include 0-9
        bool includeSymbols       // Include !@#$ etc.
    ) public returns (string memory) {
        require(length >= 8 && length <= 64, "Length must be between 8 and 64");

        // Build character set based on options
        bytes memory charset = "";
        if (includeLower) charset = abi.encodePacked(charset, "abcdefghijklmnopqrstuvwxyz");
        if (includeUpper) charset = abi.encodePacked(charset, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        if (includeNumbers) charset = abi.encodePacked(charset, "0123456789");
        if (includeSymbols) charset = abi.encodePacked(charset, "!@#$%^&*()_+-=[]{}|;:,.<>?");

        require(charset.length > 0, "At least one character type must be selected");

        bytes memory password = new bytes(length);
        uint256 nonce = 0;

        for (uint256 i = 0; i < length; i++) {
            // Pseudo-random using keccak256 + multiple entropy sources
            bytes32 randomHash = keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,  // Better than block.difficulty in newer chains
                    msg.sender,
                    userSeed,
                    nonce,
                    i
                )
            );

            uint256 randIndex = uint256(randomHash) % charset.length;
            password[i] = charset[randIndex];
            nonce++;
        }

        string memory generated = string(password);

        emit PasswordGenerated(msg.sender, generated, length);
        return generated;
    }

    // =============================================
    // 2. Password Manager Functions
    // =============================================
    function storePassword(
        string memory _site,
        string memory _username,
        string memory _encryptedPass  // Must be encrypted off-chain before sending!
    ) public {
        require(bytes(_site).length > 0, "Site cannot be empty");

        PasswordEntry memory newEntry = PasswordEntry({
            site: _site,
            username: _username,
            encryptedPass: _encryptedPass,
            timestamp: block.timestamp
        });

        userPasswords[msg.sender].push(newEntry);
        userPasswordCount[msg.sender]++;

        emit PasswordStored(msg.sender, _site, userPasswords[msg.sender].length - 1);
    }

    function getUserPasswords() public view returns (PasswordEntry[] memory) {
        return userPasswords[msg.sender];
    }

    function getPasswordCount() public view returns (uint256) {
        return userPasswordCount[msg.sender];
    }

    // Optional: Update or delete entries (add more functions as needed)
    function deletePassword(uint256 index) public {
        require(index < userPasswords[msg.sender].length, "Invalid index");
        
        // Swap with last element and pop (efficient delete)
        uint256 lastIndex = userPasswords[msg.sender].length - 1;
        userPasswords[msg.sender][index] = userPasswords[msg.sender][lastIndex];
        userPasswords[msg.sender].pop();
        
        userPasswordCount[msg.sender]--;
    }

    // Admin functions
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero");
        owner = newOwner;
    }
}
