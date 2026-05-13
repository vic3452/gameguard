# GameGuard System Diagrams

You can copy the code blocks below into [Mermaid Live Editor](https://mermaid.live/) to generate downloadable PNG/SVG images.

## 1. Login Process Flowchart
```mermaid
graph TD
    A[User enters Email/Password] --> B{Valid Input?}
    B -- No --> C[Return Validation Error]
    B -- Yes --> D[Find User in DB]
    
    D -- Not Found --> E[Return Invalid Credentials]
    D -- Found --> F{Account Locked?}
    
    F -- Yes --> G[Return Lockout Error]
    F -- No --> H{Password Match?}
    
    H -- No --> I[Increment Failed Count]
    I --> J{Failed Count >= 5?}
    J -- Yes --> K[Lock Account & Create Alert]
    J -- No --> L[Log Login Failure]
    L --> E
    
    H -- Yes --> M[Reset Failed Count]
    M --> N{2FA Enabled?}
    
    N -- Yes --> O[Generate OTP & Send Email]
    O --> P[User enters OTP]
    P --> Q{OTP Valid?}
    Q -- No --> R[Return 2FA Error]
    Q -- Yes --> S
    
    N -- No --> S[Run Threat Analysis]
    
    S --> T[Update Session & Last Login]
    T --> U[Log Login Success]
    U --> V[Generate JWT & Return User Data]
```

## 2. Threat Detection Process Flowchart
```mermaid
graph TD
    Start[Login Attempt Authenticated] --> Context[Gather Context: IP, Device, Time, Sessions]
    
    subgraph Analysis_Logic [Security Service Analysis]
        C1{New IP?} -- Yes --> F1[Flag: SUSPICIOUS_IP]
        C2{New Device?} -- Yes --> F2[Flag: SUSPICIOUS_DEVICE]
        C3{Unusual Time?} -- Yes --> F3[Flag: UNUSUAL_TIME]
        C4{Multiple Sessions?} -- Yes --> F4[Flag: CONCURRENT_SESSION]
    end
    
    Context --> C1
    Context --> C2
    Context --> C3
    Context --> C4
    
    F1 & F2 & F3 & F4 --> Action{Any Flags?}
    
    Action -- Yes --> P1[Create Database Alert]
    P1 --> P2[Create Activity Log Entry]
    P2 --> P3{Email Alerts Enabled?}
    P3 -- Yes --> P4[Send Alert Email to User]
    P3 -- No --> End
    P4 --> End
    
    Action -- No --> End[Continue Login]
```

## 3. Data Flow Diagram (DFD - Level 1)
```mermaid
graph LR
    User((User))
    Email((Email Service))
    
    subgraph GameGuard_System [Backend Application]
        P1[Auth Process]
        P2[Threat Engine]
        P3[Dashboard API]
    end
    
    subgraph Data_Storage [MongoDB]
        D1[(Users)]
        D2[(Alerts)]
        D3[(Activity Logs)]
        D4[(Gaming Accounts)]
    end
    
    User -- Credentials --> P1
    P1 -- Query/Update --> D1
    P1 -- Login Context --> P2
    
    P2 -- Create --> D2
    P2 -- Create --> D3
    P2 -- Trigger Notification --> Email
    Email -- Security Alert --> User
    
    P3 -- Fetch Data --> D1 & D2 & D3 & D4
    P3 -- JSON Response --> User
    User -- Link Account --> P3
    P3 -- Store --> D4
```

## 4. Entity Relationship Diagram (ERD)
```mermaid
erDiagram
    USER ||--o{ ACTIVITY_LOG : "has"
    USER ||--o{ ALERT : "receives"
    USER ||--o{ GAMING_ACCOUNT : "links"
    USER ||--o{ SESSION : "owns"

    USER {
        ObjectId id
        String username
        String email
        String password
        Boolean twoFactorEnabled
        String[] knownIPs
        String[] knownDevices
        Int failedLoginCount
        DateTime lockedUntil
    }

    SESSION {
        String sessionId
        String ip
        String device
        Boolean isActive
        DateTime lastActive
    }

    ACTIVITY_LOG {
        ObjectId id
        ObjectId userId
        String event
        String severity
        String ip
        String device
        Mixed details
        DateTime createdAt
    }

    ALERT {
        ObjectId id
        ObjectId userId
        String type
        String title
        String message
        String severity
        Boolean read
        DateTime createdAt
    }

    GAMING_ACCOUNT {
        ObjectId id
        ObjectId userId
        String platform
        String username
        String accountStatus
        Int riskScore
    }
```
